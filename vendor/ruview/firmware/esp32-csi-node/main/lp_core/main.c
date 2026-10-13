/**
 * @file lp_core/main.c
 * @brief LP RISC-V coprocessor motion-gate — ADR-110 Phase 5 (full).
 *
 * Polls a single LP-IO GPIO at LP_TIMER cadence (default 10 ms / 100 Hz),
 * debounces N consecutive samples, and wakes the HP core when a confirmed
 * transition matches the configured active-edge polarity. Counter +
 * last-level are exported as shared symbols so the HP side can inspect
 * them on wake.
 *
 * Shared symbols (HP-visible as `ulp_<name>` after `ulp_embed_binary`):
 *   - wake_gpio_num       (input)  : LP-IO index 0..7 on ESP32-C6
 *   - wake_active_high    (input)  : 1 = wake on rising stable, 0 = falling
 *   - debounce_samples    (input)  : consecutive matches required, default 3
 *   - motion_count        (output) : monotonic wake-trigger counter
 *   - last_gpio_level     (output) : level latched at the most recent wake
 *   - poll_count          (output) : total LP-timer ticks observed (sanity)
 *
 * Defaults are written by HP via the `ulp_*` symbols before `ulp_lp_core_run()`,
 * so the program is parameterised at boot without recompiling the LP binary.
 */

#include <stdint.h>
#include <stdbool.h>
#include "ulp_lp_core.h"
#include "ulp_lp_core_utils.h"
#include "ulp_lp_core_gpio.h"

/* --- Shared (HP/LP) state --- */
volatile uint32_t wake_gpio_num    = 4;   /* LP-IO 4 by default */
volatile uint32_t wake_active_high = 1;   /* rising edge */
volatile uint32_t debounce_samples = 3;
volatile uint32_t motion_count     = 0;
volatile uint32_t last_gpio_level  = 0;
volatile uint32_t poll_count       = 0;

/* --- Local state (persists across LP-timer wake cycles via .data) --- */
static uint32_t stable_run = 0;
static uint32_t prev_level = 0;

int main(void)
{
    poll_count++;

    /* LP-IO read returns 0/1 directly. The Kconfig-selected GPIO index maps
     * 1:1 to LP_IO on C6 for indices 0..7. */
    uint32_t level = (uint32_t)ulp_lp_core_gpio_get_level((lp_io_num_t)wake_gpio_num);

    if (level == prev_level) {
        if (stable_run < 0xFFFFu) stable_run++;
    } else {
        stable_run = 1;
        prev_level = level;
    }

    /* Trigger when level matches the configured active polarity AND has been
     * stable for `debounce_samples` consecutive reads. After firing, hold off
     * until level returns to the inactive state to avoid re-triggering on
     * the same continuous edge. */
    static uint32_t armed = 1;
    uint32_t want = wake_active_high ? 1 : 0;

    if (armed && level == want && stable_run >= debounce_samples) {
        motion_count++;
        last_gpio_level = level;
        armed = 0;
        ulp_lp_core_wakeup_main_processor();
    } else if (!armed && level != want && stable_run >= debounce_samples) {
        /* Re-arm once the line has cleanly returned to the inactive state. */
        armed = 1;
    }

    /* ulp_lp_core_halt() is called automatically when main returns. */
    return 0;
}
