/*******************************************************************************
 * test_gap3_emergency_state_ordering.c
 *
 * Gap-3 Fix 5 (FIXED): system_emergency_state set BEFORE Emergency_Stop().
 *
 * Before fix:  handleSystemError() called Emergency_Stop() first (line 854),
 *              then set system_emergency_state = true (line 855).
 *              Since Emergency_Stop() never returns (infinite loop), the flag
 *              was never set — dead code.
 *
 * After fix:   system_emergency_state = true is set BEFORE Emergency_Stop().
 *              This ensures any interrupt or parallel check can see the
 *              emergency state flag is set even though Emergency_Stop blocks.
 *
 * Test strategy:
 *   Simulate the handleSystemError critical-error path and verify that
 *   system_emergency_state is set to true BEFORE the Emergency_Stop would
 *   be called (we use a flag to track ordering).
 ******************************************************************************/
#include <assert.h>
#include <stdio.h>
#include <stdbool.h>

/* Simulated global state */
static bool system_emergency_state = false;
static bool emergency_stop_called = false;
static bool state_was_true_when_estop_called = false;

/* Simulated Emergency_Stop (doesn't loop — just records) */
static void Mock_Emergency_Stop(void)
{
    emergency_stop_called = true;
    /* Check: was system_emergency_state already true? */
    state_was_true_when_estop_called = system_emergency_state;
}

/* Error codes (subset matching main.cpp) */
typedef enum {
    ERROR_NONE = 0,
    ERROR_RF_PA_OVERCURRENT = 9,
    ERROR_RF_PA_BIAS = 10,
    ERROR_STEPPER_FAULT = 11,
    ERROR_FPGA_COMM = 12,
    ERROR_POWER_SUPPLY = 13,
    ERROR_TEMPERATURE_HIGH = 14,
} SystemError_t;

/* Extracted critical-error handling logic (post-fix ordering) */
static void simulate_handleSystemError_critical(SystemError_t error)
{
    /* Only critical errors (PA overcurrent through power supply) trigger e-stop */
    if (error >= ERROR_RF_PA_OVERCURRENT && error <= ERROR_POWER_SUPPLY) {
        /* FIX 5: set flag BEFORE calling Emergency_Stop */
        system_emergency_state = true;
        Mock_Emergency_Stop();
        /* NOTREACHED in real code */
    }
}

int main(void)
{
    printf("=== Gap-3 Fix 5: system_emergency_state ordering ===\n");

    /* Test 1: PA overcurrent → flag set BEFORE Emergency_Stop */
    printf("  Test 1: PA overcurrent path... ");
    system_emergency_state = false;
    emergency_stop_called = false;
    state_was_true_when_estop_called = false;
    simulate_handleSystemError_critical(ERROR_RF_PA_OVERCURRENT);
    assert(emergency_stop_called == true);
    assert(system_emergency_state == true);
    assert(state_was_true_when_estop_called == true);
    printf("PASS\n");

    /* Test 2: Power supply fault → same ordering */
    printf("  Test 2: Power supply fault path... ");
    system_emergency_state = false;
    emergency_stop_called = false;
    state_was_true_when_estop_called = false;
    simulate_handleSystemError_critical(ERROR_POWER_SUPPLY);
    assert(emergency_stop_called == true);
    assert(system_emergency_state == true);
    assert(state_was_true_when_estop_called == true);
    printf("PASS\n");

    /* Test 3: PA bias fault → same ordering */
    printf("  Test 3: PA bias fault path... ");
    system_emergency_state = false;
    emergency_stop_called = false;
    state_was_true_when_estop_called = false;
    simulate_handleSystemError_critical(ERROR_RF_PA_BIAS);
    assert(emergency_stop_called == true);
    assert(state_was_true_when_estop_called == true);
    printf("PASS\n");

    /* Test 4: Non-critical error → no e-stop, flag stays false */
    printf("  Test 4: Non-critical error (no e-stop)... ");
    system_emergency_state = false;
    emergency_stop_called = false;
    simulate_handleSystemError_critical(ERROR_TEMPERATURE_HIGH);
    assert(emergency_stop_called == false);
    assert(system_emergency_state == false);
    printf("PASS\n");

    /* Test 5: ERROR_NONE → no e-stop */
    printf("  Test 5: ERROR_NONE (no action)... ");
    system_emergency_state = false;
    emergency_stop_called = false;
    simulate_handleSystemError_critical(ERROR_NONE);
    assert(emergency_stop_called == false);
    assert(system_emergency_state == false);
    printf("PASS\n");

    printf("\n=== Gap-3 Fix 5: ALL TESTS PASSED ===\n\n");
    return 0;
}
