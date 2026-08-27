#pragma once

#include <stdint.h>
#include "esp_err.h"

typedef struct {
    int8_t rssi;
    uint8_t primary;
} wifi_ap_record_t;

static inline esp_err_t esp_wifi_sta_get_ap_info(wifi_ap_record_t* ap_info) {
    (void)ap_info;
    return ESP_FAIL;
}
