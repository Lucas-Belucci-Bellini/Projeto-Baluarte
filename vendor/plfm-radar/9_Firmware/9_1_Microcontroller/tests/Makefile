################################################################################
# Makefile -- MCU firmware unit test harness for AERIS-10
#
# Builds and runs host-side (macOS) tests for all discovered firmware bugs.
# Uses mock HAL + spy/recording pattern to test real firmware code without
# hardware.
#
# Usage:
#   make          -- build and run all tests
#   make build    -- build all tests without running
#   make test     -- run all tests
#   make clean    -- remove build artifacts
#   make test_bug1  -- build and run just bug1 test
#
# Requirements: Apple Clang or gcc (any C11-capable compiler)
################################################################################

CC       := cc
CFLAGS   := -std=c11 -Wall -Wextra -Wno-unused-parameter -g -O0
# Shim headers come FIRST so they override real headers
INCLUDES := -Ishims -I. -I../9_1_1_C_Cpp_Libraries

# Real source files compiled against mock headers
REAL_SRC := ../9_1_1_C_Cpp_Libraries/adf4382a_manager.c

# Mock/stub object files (shared across tests)
MOCK_SRCS := stm32_hal_mock.c ad_driver_mock.c
MOCK_OBJS := $(MOCK_SRCS:.c=.o)

# Real source compiled as object (for tests that need it)
REAL_OBJ  := adf4382a_manager.o

# Platform source compiled with shim headers
PLATFORM_SRC := ../9_1_1_C_Cpp_Libraries/platform_noos_stm32.c
PLATFORM_OBJ := platform_noos_stm32.o

# Tests that link against real adf4382a_manager.c + mocks
TESTS_WITH_REAL := test_bug1_timed_sync_init_ordering \
                   test_bug3_timed_sync_noop \
                   test_bug4_phase_shift_before_check \
                   test_bug5_fine_phase_gpio_only \
                   test_bug9_platform_ops_null \
                   test_bug10_spi_cs_not_toggled \
                   test_bug15_htim3_dangling_extern

# Tests that only need mocks (extracted patterns / static analysis)
TESTS_MOCK_ONLY := test_bug2_ad9523_double_setup \
                   test_bug6_timer_variable_collision \
                   test_bug7_gpio_pin_conflict \
                   test_bug8_uart_commented_out \
                   test_bug14_diag_section_args \
                   test_gap3_emergency_stop_rails

# Tests that are standalone (no mocks needed, pure logic)
TESTS_STANDALONE := test_bug12_pa_cal_loop_inverted \
                    test_bug13_dac2_adc_buffer_mismatch \
                    test_gap3_iwdg_config \
                    test_gap3_temperature_max \
                    test_gap3_idq_periodic_reread \
                    test_gap3_emergency_state_ordering

# Tests that need platform_noos_stm32.o + mocks
TESTS_WITH_PLATFORM := test_bug11_platform_spi_transmit_only

ALL_TESTS := $(TESTS_WITH_REAL) $(TESTS_MOCK_ONLY) $(TESTS_STANDALONE) $(TESTS_WITH_PLATFORM)

.PHONY: all build test clean \
        $(addprefix test_,bug1 bug2 bug3 bug4 bug5 bug6 bug7 bug8 bug9 bug10 bug11 bug12 bug13 bug14 bug15) \
        test_gap3_estop test_gap3_iwdg test_gap3_temp test_gap3_idq test_gap3_order

all: build test

build: $(ALL_TESTS)

test: build
	@echo "==============================================="
	@echo "  Running all $(words $(ALL_TESTS)) bug tests..."
	@echo "==============================================="
	@pass=0; fail=0; \
	for t in $(ALL_TESTS); do \
		echo "--- Running $$t ---"; \
		./$$t; \
		if [ $$? -eq 0 ]; then \
			pass=$$((pass + 1)); \
		else \
			fail=$$((fail + 1)); \
			echo "*** FAILED: $$t ***"; \
		fi; \
	done; \
	echo "==============================================="; \
	echo "  Results: $$pass passed, $$fail failed (of $(words $(ALL_TESTS)) total)"; \
	echo "==============================================="; \
	[ $$fail -eq 0 ]

# --- Object file rules ---

%.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

# Real source compiled with shim headers
$(REAL_OBJ): $(REAL_SRC) $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) -c $(REAL_SRC) -o $@

# Platform source compiled with shim headers
$(PLATFORM_OBJ): $(PLATFORM_SRC) $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) -c $(PLATFORM_SRC) -o $@

# --- Test binary rules ---

# Tests that need real adf4382a_manager.o + mocks
$(TESTS_WITH_REAL): %: %.c $(MOCK_OBJS) $(REAL_OBJ)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) $(REAL_OBJ) -o $@

# Tests that only need mocks
test_bug2_ad9523_double_setup: test_bug2_ad9523_double_setup.c $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) -o $@

test_bug6_timer_variable_collision: test_bug6_timer_variable_collision.c $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) -o $@

# Bug 7 needs shim headers + mock objects (post-fix test includes shim adf4382a_manager.h)
test_bug7_gpio_pin_conflict: test_bug7_gpio_pin_conflict.c $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) -o $@

test_bug8_uart_commented_out: test_bug8_uart_commented_out.c
	$(CC) $(CFLAGS) -I. $< -o $@

test_bug14_diag_section_args: test_bug14_diag_section_args.c $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) -o $@

# Standalone tests (pure logic, no mocks)
test_bug12_pa_cal_loop_inverted: test_bug12_pa_cal_loop_inverted.c
	$(CC) $(CFLAGS) $< -lm -o $@

test_bug13_dac2_adc_buffer_mismatch: test_bug13_dac2_adc_buffer_mismatch.c
	$(CC) $(CFLAGS) $< -lm -o $@

# Gap-3 safety tests -- mock-only (needs spy log for GPIO sequence)
test_gap3_emergency_stop_rails: test_gap3_emergency_stop_rails.c $(MOCK_OBJS)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) -o $@

# Gap-3 safety tests -- standalone (pure logic)
test_gap3_iwdg_config: test_gap3_iwdg_config.c
	$(CC) $(CFLAGS) $< -lm -o $@

test_gap3_temperature_max: test_gap3_temperature_max.c
	$(CC) $(CFLAGS) $< -lm -o $@

test_gap3_idq_periodic_reread: test_gap3_idq_periodic_reread.c
	$(CC) $(CFLAGS) $< -lm -o $@

test_gap3_emergency_state_ordering: test_gap3_emergency_state_ordering.c
	$(CC) $(CFLAGS) $< -o $@

# Tests that need platform_noos_stm32.o + mocks
$(TESTS_WITH_PLATFORM): %: %.c $(MOCK_OBJS) $(PLATFORM_OBJ)
	$(CC) $(CFLAGS) $(INCLUDES) $< $(MOCK_OBJS) $(PLATFORM_OBJ) -o $@

# --- Individual test targets ---

test_bug1: test_bug1_timed_sync_init_ordering
	./test_bug1_timed_sync_init_ordering

test_bug2: test_bug2_ad9523_double_setup
	./test_bug2_ad9523_double_setup

test_bug3: test_bug3_timed_sync_noop
	./test_bug3_timed_sync_noop

test_bug4: test_bug4_phase_shift_before_check
	./test_bug4_phase_shift_before_check

test_bug5: test_bug5_fine_phase_gpio_only
	./test_bug5_fine_phase_gpio_only

test_bug6: test_bug6_timer_variable_collision
	./test_bug6_timer_variable_collision

test_bug7: test_bug7_gpio_pin_conflict
	./test_bug7_gpio_pin_conflict

test_bug8: test_bug8_uart_commented_out
	./test_bug8_uart_commented_out

test_bug9: test_bug9_platform_ops_null
	./test_bug9_platform_ops_null

test_bug10: test_bug10_spi_cs_not_toggled
	./test_bug10_spi_cs_not_toggled

test_bug11: test_bug11_platform_spi_transmit_only
	./test_bug11_platform_spi_transmit_only

test_bug12: test_bug12_pa_cal_loop_inverted
	./test_bug12_pa_cal_loop_inverted

test_bug13: test_bug13_dac2_adc_buffer_mismatch
	./test_bug13_dac2_adc_buffer_mismatch

test_bug14: test_bug14_diag_section_args
	./test_bug14_diag_section_args

test_bug15: test_bug15_htim3_dangling_extern
	./test_bug15_htim3_dangling_extern

test_gap3_estop: test_gap3_emergency_stop_rails
	./test_gap3_emergency_stop_rails

test_gap3_iwdg: test_gap3_iwdg_config
	./test_gap3_iwdg_config

test_gap3_temp: test_gap3_temperature_max
	./test_gap3_temperature_max

test_gap3_idq: test_gap3_idq_periodic_reread
	./test_gap3_idq_periodic_reread

test_gap3_order: test_gap3_emergency_state_ordering
	./test_gap3_emergency_state_ordering

# --- Clean ---

clean:
	rm -f *.o $(ALL_TESTS)
	@echo "Clean complete"
