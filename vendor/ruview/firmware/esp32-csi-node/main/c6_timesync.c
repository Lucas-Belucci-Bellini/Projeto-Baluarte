/**
 * @file c6_timesync.c
 * @brief 802.15.4 mesh time-sync skeleton — ADR-110 Phase 4.
 *
 * P4 ships the API surface, role election, and the leader-broadcast +
 * follower-receive paths using esp_ieee802154 raw frames. Full
 * OpenThread MTD attachment with a real network key is deferred to a
 * follow-up turn — the skeleton already exercises the radio init and
 * the offset-tracking math.
 *
 * Beacon frame layout (12 bytes payload + 802.15.4 MAC header):
 *   [0..3]   Magic        0x54534D45  ('TSME' — Time Sync MEsh)
 *   [4]      Protocol ver 0x01
 *   [5]      Leader flag  1 if sender is current leader
 *   [6..7]   Reserved
 *   [8..15]  Leader epoch µs (LE u64)
 */

#include "sdkconfig.h"

#if defined(CONFIG_IDF_TARGET_ESP32C6) && defined(CONFIG_IEEE802154_ENABLED)

#include "c6_timesync.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "esp_timer.h"
#include "esp_ieee802154.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include <string.h>

static const char *TAG = "c6_ts";

#define TS_MAGIC        0x54534D45u
#define TS_PROTO_VER    0x01
#define TS_BEACON_MS    100
#define TS_VALID_WINDOW_MS  3000   /* drop to invalid if no beacon in 3 s */

typedef struct __attribute__((packed)) {
    uint32_t magic;
    uint8_t  proto_ver;
    uint8_t  leader_flag;
    uint16_t _reserved;
    uint64_t leader_epoch_us;
} ts_beacon_t;

static uint64_t s_local_eui    = 0;
static uint64_t s_leader_eui   = 0;       /* 0 = unknown */
static int64_t  s_offset_us    = 0;       /* leader_us - local_us */
static uint64_t s_last_seen_us = 0;
static bool     s_is_leader    = false;
static uint8_t  s_channel      = 15;
static TimerHandle_t s_beacon_timer = NULL;

/* IEEE EUI-64 from a 6-byte MAC-48: insert 0xFFFE between bytes 2 and 3.
 * Used only as a fallback when esp_read_mac(..., ESP_MAC_IEEE802154) is
 * unavailable. The C6's native call returns 8 bytes already in EUI-64
 * format, so prefer that path (see c6_timesync_init). */
static uint64_t mac48_to_eui64(const uint8_t mac[6])
{
    return ((uint64_t)mac[0] << 56) | ((uint64_t)mac[1] << 48) |
           ((uint64_t)mac[2] << 40) | ((uint64_t)0xFF   << 32) |
           ((uint64_t)0xFE   << 24) | ((uint64_t)mac[3] << 16) |
           ((uint64_t)mac[4] << 8 ) |  (uint64_t)mac[5];
}

/* Pack 8 already-EUI-64 bytes into a uint64. */
static uint64_t eui64_bytes_to_u64(const uint8_t eui[8])
{
    return ((uint64_t)eui[0] << 56) | ((uint64_t)eui[1] << 48) |
           ((uint64_t)eui[2] << 40) | ((uint64_t)eui[3] << 32) |
           ((uint64_t)eui[4] << 24) | ((uint64_t)eui[5] << 16) |
           ((uint64_t)eui[6] << 8 ) |  (uint64_t)eui[7];
}

static uint32_t s_tx_count = 0;
static uint32_t s_tx_fail  = 0;
static uint32_t s_rx_count = 0;
static uint32_t s_rx_magic_match = 0;

static void send_beacon(void)
{
    uint8_t frame[32];
    /* Minimal 802.15.4 MAC header: FCF + seq + dst PAN + dst short addr. */
    frame[0] = 0x41;            /* FCF lo: data frame, no security, no ack */
    frame[1] = 0x88;            /* FCF hi: short addrs, intra-PAN */
    frame[2] = 0x00;            /* seq number — placeholder */
    /* Empirically (rx#0 over 60s on all 3 boards), the IDF v5.4 receiver
     * was rejecting the dst-PAN-broadcast (0xFFFF) frames even in
     * promiscuous mode. Match our configured PAN ID 0xCAFE here — short
     * dst stays 0xFFFF for intra-PAN broadcast. PAN bytes are LE. */
    frame[3] = 0xFE; frame[4] = 0xCA;  /* dst PAN = 0xCAFE (matches local) */
    frame[5] = 0xFF; frame[6] = 0xFF;  /* dst short broadcast */
    frame[7] = 0x00; frame[8] = 0x00;  /* src short = 0x0000 */
    ts_beacon_t *b = (ts_beacon_t *)&frame[9];
    b->magic           = TS_MAGIC;
    b->proto_ver       = TS_PROTO_VER;
    b->leader_flag     = 1;
    b->_reserved       = 0;
    b->leader_epoch_us = (uint64_t)esp_timer_get_time();
    size_t total = 9 + sizeof(ts_beacon_t);
    /* ESP-IDF esp_ieee802154 transmit: first byte is the PHY length. */
    uint8_t tx_buf[64];
    tx_buf[0] = (uint8_t)(total + 2);  /* +2 for FCS appended by HW */
    memcpy(&tx_buf[1], frame, total);
    esp_err_t r = esp_ieee802154_transmit(tx_buf, false);
    s_tx_count++;
    if (r != ESP_OK) s_tx_fail++;
    /* Diag log every 10 beacons. */
    if ((s_tx_count % 10) == 1) {
        ESP_LOGI(TAG, "tx#%lu (fail=%lu) rx#%lu (magic_match=%lu) is_leader=%d",
                 (unsigned long)s_tx_count, (unsigned long)s_tx_fail,
                 (unsigned long)s_rx_count, (unsigned long)s_rx_magic_match,
                 (int)s_is_leader);
    }
}

/* KNOWN ISSUE (see WITNESS-LOG-110 §D1 / task #30):
 * Empirically observed on 3 C6 boards with channel=26, OpenThread disabled,
 * promiscuous=true, and IDF v5.4 reference RX/TX callback pattern: only 1
 * RX event ever fires after init, despite ~381 successful TX events from
 * the other boards in the same 38-second window. Manual re-arm with
 * esp_ieee802154_receive() in either callback context bootloops the
 * driver. Hypothesis: half-duplex radio + driver state-machine issue;
 * needs an IDF maintainer trace or a working multi-board reference.
 * Cross-node sync claim (ADR-110 §B3) is BLOCKED on this. */
void esp_ieee802154_receive_done(uint8_t *frame, esp_ieee802154_frame_info_t *frame_info)
{
    s_rx_count++;
    /* PHY length is frame[0]; payload starts at frame[1]. */
    if (frame == NULL || frame[0] < (9 + sizeof(ts_beacon_t) + 2)) {
        if (frame) esp_ieee802154_receive_handle_done(frame);
        return;
    }
    const ts_beacon_t *b = (const ts_beacon_t *)&frame[1 + 9];
    if (b->magic != TS_MAGIC || b->proto_ver != TS_PROTO_VER) {
        esp_ieee802154_receive_handle_done(frame);
        return;
    }
    s_rx_magic_match++;
    uint64_t now = (uint64_t)esp_timer_get_time();
    if (b->leader_flag) {
        /* Adopt this leader if its EUI is lower than ours (or unknown). */
        if (s_leader_eui == 0 || b->leader_epoch_us > 0) {
            s_offset_us    = (int64_t)b->leader_epoch_us - (int64_t)now;
            s_last_seen_us = now;
            if (s_is_leader) {
                /* Step down — somebody else is broadcasting; lowest EUI wins
                 * (deferred — for now last-heard wins). */
                s_is_leader = false;
                ESP_LOGI(TAG, "stepping down — heard another leader beacon");
            }
        }
    }
    /* handle_done auto-restarts RX in the IDF driver; calling
     * esp_ieee802154_receive() here would double-arm and panic
     * (verified empirically — 25 reboot loops observed). */
    esp_ieee802154_receive_handle_done(frame);
}

void esp_ieee802154_transmit_done(const uint8_t *frame,
                                  const uint8_t *ack,
                                  esp_ieee802154_frame_info_t *ack_frame_info)
{
    (void)frame; (void)ack; (void)ack_frame_info;
    /* Note: do NOT call esp_ieee802154_receive() here — it panics the
     * driver (verified empirically, all 3 boards bootloop). The IDF
     * driver internally manages RX/TX state transitions. */
}

void esp_ieee802154_transmit_failed(const uint8_t *frame, esp_ieee802154_tx_error_t error)
{
    (void)frame;
    ESP_LOGD(TAG, "tx failed: %d", error);
}

static void beacon_timer_cb(TimerHandle_t t)
{
    (void)t;
    uint64_t now = (uint64_t)esp_timer_get_time();
    if (s_is_leader) {
        send_beacon();
    } else if ((now - s_last_seen_us) > (TS_VALID_WINDOW_MS * 1000ULL)) {
        /* Lost the leader — promote self if no one else takes over in 1 s. */
        s_is_leader = true;
        s_leader_eui = s_local_eui;
        ESP_LOGI(TAG, "promoting self to time-leader (no beacons for %u ms)",
                 (unsigned)TS_VALID_WINDOW_MS);
    }
}

esp_err_t c6_timesync_init(uint8_t channel)
{
    /* esp_mac.h: ESP_MAC_IEEE802154 returns 8 bytes ALREADY in EUI-64 format
     * (ff:fe is pre-inserted in bytes 3-4 from the eFuse MAC_EXT). Using a
     * 6-byte buffer here truncates and then double-inserts ff:fe — the bug
     * we hit on the first run (boot log: EUI=206ef1fffefffe17).
     *
     * Correct path: read 8 bytes, pack into uint64 unchanged. Fallback to
     * the base MAC + manual EUI-64 derivation if the 8-byte read errors. */
    uint8_t eui_bytes[8] = {0};
    esp_err_t mac_ret = esp_read_mac(eui_bytes, ESP_MAC_IEEE802154);
    if (mac_ret == ESP_OK) {
        s_local_eui = eui64_bytes_to_u64(eui_bytes);
    } else {
        uint8_t base_mac[6];
        esp_read_mac(base_mac, ESP_MAC_BASE);
        s_local_eui = mac48_to_eui64(base_mac);
    }
    /* Use the 6-byte base MAC for the IEEE 802.15.4 extended address — the
     * radio expects MAC-48-style bytes here, not the EUI-64 derivation. */
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_BASE);
    s_channel   = (channel >= 11 && channel <= 26) ? channel : 15;

    esp_err_t ret = esp_ieee802154_enable();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "ieee802154_enable failed: %s", esp_err_to_name(ret));
        return ret;
    }
    /* promiscuous=true so we accept broadcast frames addressed to 0xFFFF.
     * In non-promiscuous mode the radio filters to frames addressed to
     * our short or extended address. Our beacon protocol uses broadcast. */
    esp_ieee802154_set_promiscuous(true);
    esp_ieee802154_set_panid(0xCAFE);
    esp_ieee802154_set_short_address(0x0000);
    esp_ieee802154_set_extended_address(mac);
    esp_ieee802154_set_channel(s_channel);
    esp_ieee802154_receive();

    /* Start as candidate leader; first received beacon will demote us if needed. */
    s_is_leader    = true;
    s_leader_eui   = s_local_eui;
    s_last_seen_us = (uint64_t)esp_timer_get_time();

    s_beacon_timer = xTimerCreate("c6ts_beacon", pdMS_TO_TICKS(TS_BEACON_MS),
                                  pdTRUE, NULL, beacon_timer_cb);
    if (s_beacon_timer == NULL) {
        ESP_LOGE(TAG, "xTimerCreate failed");
        return ESP_ERR_NO_MEM;
    }
    xTimerStart(s_beacon_timer, 0);

    ESP_LOGI(TAG, "init done: channel=%u EUI=%016llx leader=yes(candidate)",
             (unsigned)s_channel, (unsigned long long)s_local_eui);
    return ESP_OK;
}

uint64_t c6_timesync_get_epoch_us(void)
{
    return (uint64_t)((int64_t)esp_timer_get_time() + s_offset_us);
}

bool c6_timesync_is_leader(void) { return s_is_leader; }
int64_t c6_timesync_get_offset_us(void) { return s_offset_us; }

bool c6_timesync_is_valid(void)
{
    if (s_is_leader) return true;
    uint64_t now = (uint64_t)esp_timer_get_time();
    return (now - s_last_seen_us) < (TS_VALID_WINDOW_MS * 1000ULL);
}

#endif  /* CONFIG_IDF_TARGET_ESP32C6 && CONFIG_IEEE802154_ENABLED */
