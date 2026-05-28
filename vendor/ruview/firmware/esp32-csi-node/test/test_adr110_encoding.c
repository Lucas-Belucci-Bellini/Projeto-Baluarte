/**
 * @file test_adr110_encoding.c
 * @brief Host-side unit tests for ADR-110 pure functions.
 *
 * Covers the two encoding paths that don't need ESP-IDF runtime:
 *   1. mac_to_eui64() — IEEE EUI-64 from MAC-48 (c6_timesync.c)
 *   2. PPDU-type → ADR-018 byte 18 mapping for both HE-capable and
 *      legacy paths (csi_collector.c)
 *
 * Build (Linux/macOS/Windows with any C99 compiler):
 *   cc -std=c99 -Wall -o test_adr110 test_adr110_encoding.c && ./test_adr110
 *
 * Or in WSL on this Windows box:
 *   gcc -std=c99 -Wall -o test_adr110 test_adr110_encoding.c && ./test_adr110
 *
 * Exits 0 on all-pass, prints which assertion failed otherwise.
 *
 * Why a separate host test file rather than extending the existing fuzz
 * harness: fuzzers want random bytes; these are deterministic table-driven
 * checks for tiny pure functions where libFuzzer adds no signal.
 */

#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* ──────────────────────────────────────────────────────────────────────
 *  System under test — copied verbatim from the firmware. If the
 *  firmware copy changes, this test must be updated and the new behavior
 *  attested by re-running the test before the firmware change merges.
 * ────────────────────────────────────────────────────────────────────── */

/* From firmware/esp32-csi-node/main/c6_timesync.c — fallback path used only
 * when esp_read_mac(..., ESP_MAC_IEEE802154) fails. The primary C6 path
 * reads 8 bytes directly (the eFuse-provided EUI-64). */
static uint64_t mac48_to_eui64(const uint8_t mac[6])
{
    return ((uint64_t)mac[0] << 56) | ((uint64_t)mac[1] << 48) |
           ((uint64_t)mac[2] << 40) | ((uint64_t)0xFF   << 32) |
           ((uint64_t)0xFE   << 24) | ((uint64_t)mac[3] << 16) |
           ((uint64_t)mac[4] << 8 ) |  (uint64_t)mac[5];
}

/* Pack 8-byte EUI-64 buffer (as returned by ESP_MAC_IEEE802154) into u64. */
static uint64_t eui64_bytes_to_u64(const uint8_t eui[8])
{
    return ((uint64_t)eui[0] << 56) | ((uint64_t)eui[1] << 48) |
           ((uint64_t)eui[2] << 40) | ((uint64_t)eui[3] << 32) |
           ((uint64_t)eui[4] << 24) | ((uint64_t)eui[5] << 16) |
           ((uint64_t)eui[6] << 8 ) |  (uint64_t)eui[7];
}

/* From firmware/esp32-csi-node/main/csi_collector.c — HE-capable branch.
 * Returns the ADR-018 byte-18 PPDU type. */
static uint8_t ppdu_type_he(uint8_t cur_bb_format)
{
    switch (cur_bb_format) {
        case 0:
        case 1:
        case 2:  return 0;          /* 11b/g/a/HT bucket */
        case 3:  return 0;          /* VHT */
        case 4:  return 1;          /* HE-SU */
        case 5:  return 2;          /* HE-MU */
        case 6:  return 1;          /* HE-ER-SU collapses to HE-SU */
        case 7:  return 3;          /* HE-TB */
        default: return 0xFF;
    }
}

/* From csi_collector.c — legacy (non-HE) branch. */
static uint8_t ppdu_type_legacy(uint8_t sig_mode)
{
    switch (sig_mode) {
        case 0:  return 0;          /* non-HT */
        case 1:  return 0;          /* HT */
        case 3:  return 0;          /* VHT */
        default: return 0xFF;
    }
}

/* ──────────────────────────────────────────────────────────────────────
 *  Test harness
 * ────────────────────────────────────────────────────────────────────── */

static int g_failed = 0;
static int g_passed = 0;

#define CHECK_EQ_U64(label, got, expected) do {                            \
    if ((got) == (expected)) { g_passed++; }                                \
    else {                                                                  \
        g_failed++;                                                         \
        printf("FAIL: %s — got=0x%016llx expected=0x%016llx\n",             \
               (label), (unsigned long long)(got),                          \
               (unsigned long long)(expected));                             \
    }                                                                       \
} while (0)

#define CHECK_EQ_U8(label, got, expected) do {                              \
    if ((uint8_t)(got) == (uint8_t)(expected)) { g_passed++; }              \
    else {                                                                  \
        g_failed++;                                                         \
        printf("FAIL: %s — got=0x%02x expected=0x%02x\n",                   \
               (label), (unsigned)(got), (unsigned)(expected));             \
    }                                                                       \
} while (0)

/* ──────────────────────────────────────────────────────────────────────
 *  EUI-64 tests
 *
 *  IEEE 802 MAC-48 → EUI-64 spec: insert 0xFFFE between bytes 3 and 4
 *  of the MAC. ADR-110's c6_timesync.c does exactly that, leaving the
 *  U/L bit in byte 0 untouched (the c6 EUI then matches what `esp_read_mac
 *  ESP_MAC_IEEE802154` returns).
 * ────────────────────────────────────────────────────────────────────── */

static void test_eui64_fallback_zero_mac(void)
{
    uint8_t mac[6] = {0, 0, 0, 0, 0, 0};
    /* mac48_to_eui64 inserts FFFE → 00 00 00 FF FE 00 00 00 */
    CHECK_EQ_U64("mac48->eui64 zero", mac48_to_eui64(mac), 0x000000FFFE000000ULL);
}

static void test_eui64_fallback_all_ones(void)
{
    uint8_t mac[6] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
    /* FF FF FF FF FE FF FF FF */
    CHECK_EQ_U64("mac48->eui64 all-ones", mac48_to_eui64(mac), 0xFFFFFFFFFEFFFFFFULL);
}

static void test_eui64_fallback_byte_order(void)
{
    uint8_t mac[6] = {0x11, 0x22, 0x33, 0x44, 0x55, 0x66};
    CHECK_EQ_U64("mac48->eui64 byte order", mac48_to_eui64(mac), 0x112233FFFE445566ULL);
}

/* Primary path: 8-byte EUI-64 from ESP_MAC_IEEE802154 packed unchanged.
 * Verified by esptool's chip_id output on the real C6 hardware:
 *   COM6: BASE MAC 20:6e:f1:17:27:8c, MAC_EXT ff:fe →
 *          full EUI: 20:6e:f1:ff:fe:17:27:8c → 0x206EF1FFFE17278C
 *   COM9: BASE MAC 20:6e:f1:17:05:3c, MAC_EXT ff:fe →
 *          full EUI: 20:6e:f1:ff:fe:17:05:3c → 0x206EF1FFFE17053C
 *
 * Note COM9's EUI is numerically smaller — it wins the leader election. */
static void test_eui64_from_native_com6(void)
{
    uint8_t eui[8] = {0x20, 0x6e, 0xf1, 0xff, 0xfe, 0x17, 0x27, 0x8c};
    CHECK_EQ_U64("native eui64 COM6", eui64_bytes_to_u64(eui), 0x206EF1FFFE17278CULL);
}

static void test_eui64_from_native_com9(void)
{
    uint8_t eui[8] = {0x20, 0x6e, 0xf1, 0xff, 0xfe, 0x17, 0x05, 0x3c};
    CHECK_EQ_U64("native eui64 COM9", eui64_bytes_to_u64(eui), 0x206EF1FFFE17053CULL);
}

static void test_eui64_leader_election_order(void)
{
    uint8_t com6[8] = {0x20, 0x6e, 0xf1, 0xff, 0xfe, 0x17, 0x27, 0x8c};
    uint8_t com9[8] = {0x20, 0x6e, 0xf1, 0xff, 0xfe, 0x17, 0x05, 0x3c};
    uint64_t a = eui64_bytes_to_u64(com6);
    uint64_t b = eui64_bytes_to_u64(com9);
    /* Lowest EUI wins → COM9 should be leader when both boards online. */
    if (b < a) { g_passed++; }
    else { g_failed++; printf("FAIL: leader-election order — expected COM9 < COM6\n"); }
}

/* ──────────────────────────────────────────────────────────────────────
 *  PPDU-type encoding tests — HE-capable branch (C6/C5)
 * ────────────────────────────────────────────────────────────────────── */

static void test_ppdu_he_legacy_bucket(void)
{
    CHECK_EQ_U8("he 0 → 0 (11b)",   ppdu_type_he(0), 0);
    CHECK_EQ_U8("he 1 → 0 (11g/a)", ppdu_type_he(1), 0);
    CHECK_EQ_U8("he 2 → 0 (HT)",    ppdu_type_he(2), 0);
    CHECK_EQ_U8("he 3 → 0 (VHT)",   ppdu_type_he(3), 0);
}

static void test_ppdu_he_su(void)
{
    CHECK_EQ_U8("he 4 → 1 (HE-SU)",    ppdu_type_he(4), 1);
    CHECK_EQ_U8("he 6 → 1 (HE-ER-SU)", ppdu_type_he(6), 1);
}

static void test_ppdu_he_mu(void)
{
    CHECK_EQ_U8("he 5 → 2 (HE-MU)", ppdu_type_he(5), 2);
}

static void test_ppdu_he_tb(void)
{
    CHECK_EQ_U8("he 7 → 3 (HE-TB)", ppdu_type_he(7), 3);
}

static void test_ppdu_he_out_of_range(void)
{
    CHECK_EQ_U8("he 8 → 0xFF (unknown)",   ppdu_type_he(8),   0xFF);
    CHECK_EQ_U8("he 15 → 0xFF (unknown)",  ppdu_type_he(15),  0xFF);
}

/* ──────────────────────────────────────────────────────────────────────
 *  PPDU-type encoding tests — legacy (S3/etc) branch
 * ────────────────────────────────────────────────────────────────────── */

static void test_ppdu_legacy_known(void)
{
    CHECK_EQ_U8("legacy sig_mode 0 → 0 (non-HT)", ppdu_type_legacy(0), 0);
    CHECK_EQ_U8("legacy sig_mode 1 → 0 (HT)",      ppdu_type_legacy(1), 0);
    CHECK_EQ_U8("legacy sig_mode 3 → 0 (VHT)",     ppdu_type_legacy(3), 0);
}

static void test_ppdu_legacy_unknown(void)
{
    CHECK_EQ_U8("legacy sig_mode 2 → 0xFF",  ppdu_type_legacy(2), 0xFF);
    CHECK_EQ_U8("legacy sig_mode 5 → 0xFF",  ppdu_type_legacy(5), 0xFF);
}

/* ──────────────────────────────────────────────────────────────────────
 *  main
 * ────────────────────────────────────────────────────────────────────── */

int main(void)
{
    test_eui64_fallback_zero_mac();
    test_eui64_fallback_all_ones();
    test_eui64_fallback_byte_order();
    test_eui64_from_native_com6();
    test_eui64_from_native_com9();
    test_eui64_leader_election_order();

    test_ppdu_he_legacy_bucket();
    test_ppdu_he_su();
    test_ppdu_he_mu();
    test_ppdu_he_tb();
    test_ppdu_he_out_of_range();

    test_ppdu_legacy_known();
    test_ppdu_legacy_unknown();

    printf("\n%d passed, %d failed\n", g_passed, g_failed);
    return g_failed == 0 ? 0 : 1;
}
