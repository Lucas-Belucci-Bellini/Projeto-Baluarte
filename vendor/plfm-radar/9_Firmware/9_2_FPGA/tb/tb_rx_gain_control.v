`timescale 1ns / 1ps

/**
 * tb_rx_gain_control.v
 *
 * Unit test for rx_gain_control — host-configurable digital gain
 * between DDC output and matched filter input.
 *
 * Tests:
 *   1. Pass-through (shift=0): output == input
 *   2. Left shift (amplify): correct gain, saturation on overflow
 *   3. Right shift (attenuate): correct arithmetic shift
 *   4. Saturation counter: counts clipped samples
 *   5. Negative inputs: sign-correct shifting
 *   6. Max shift amounts (7 bits each direction)
 *   7. Valid signal pipeline: 1-cycle latency
 *   8. Dynamic gain change: gain_shift can change between samples
 *   9. Counter stops at 255 (no wrap)
 *  10. Reset clears everything
 */

module tb_rx_gain_control;

// ---------------------------------------------------------------
// Clock and reset
// ---------------------------------------------------------------
reg clk;
reg reset_n;

initial clk = 0;
always #5 clk = ~clk;  // 100 MHz

// ---------------------------------------------------------------
// DUT signals
// ---------------------------------------------------------------
reg signed [15:0] data_i_in;
reg signed [15:0] data_q_in;
reg               valid_in;
reg [3:0]         gain_shift;

wire signed [15:0] data_i_out;
wire signed [15:0] data_q_out;
wire               valid_out;
wire [7:0]         saturation_count;

rx_gain_control dut (
    .clk(clk),
    .reset_n(reset_n),
    .data_i_in(data_i_in),
    .data_q_in(data_q_in),
    .valid_in(valid_in),
    .gain_shift(gain_shift),
    .data_i_out(data_i_out),
    .data_q_out(data_q_out),
    .valid_out(valid_out),
    .saturation_count(saturation_count)
);

// ---------------------------------------------------------------
// Test infrastructure
// ---------------------------------------------------------------
integer pass_count = 0;
integer fail_count = 0;

task check;
    input cond;
    input [1023:0] msg;
    begin
        if (cond) begin
            $display("[PASS] %0s", msg);
            pass_count = pass_count + 1;
        end else begin
            $display("[FAIL] %0s", msg);
            fail_count = fail_count + 1;
        end
    end
endtask

// Send one sample and wait for output (1-cycle latency)
task send_sample;
    input signed [15:0] i_val;
    input signed [15:0] q_val;
    begin
        @(negedge clk);
        data_i_in = i_val;
        data_q_in = q_val;
        valid_in  = 1'b1;
        @(posedge clk);  // DUT registers input
        @(negedge clk);
        valid_in = 1'b0;
        @(posedge clk);  // output available after this edge
        #1;              // let NBA settle
    end
endtask

// ---------------------------------------------------------------
// Test sequence
// ---------------------------------------------------------------
initial begin
    $display("=== RX Gain Control Unit Test ===");

    // Init
    reset_n    = 0;
    data_i_in  = 0;
    data_q_in  = 0;
    valid_in   = 0;
    gain_shift = 4'd0;

    repeat (4) @(posedge clk);
    reset_n = 1;
    repeat (2) @(posedge clk);

    // ---------------------------------------------------------------
    // TEST 1: Pass-through (gain_shift = 0)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 1: Pass-through (shift=0) ---");

    gain_shift = 4'b0_000;  // left shift 0 = pass-through
    send_sample(16'sd1000, 16'sd2000);
    check(data_i_out == 16'sd1000,
          "T1.1: I pass-through (1000)");
    check(data_q_out == 16'sd2000,
          "T1.2: Q pass-through (2000)");
    check(saturation_count == 8'd0,
          "T1.3: No saturation on pass-through");

    // ---------------------------------------------------------------
    // TEST 2: Left shift (amplify) without overflow
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 2: Left shift (amplify) ---");

    gain_shift = 4'b0_010;  // left shift 2 = x4
    send_sample(16'sd500, -16'sd300);
    check(data_i_out == 16'sd2000,
          "T2.1: I amplified 500<<2 = 2000");
    check(data_q_out == -16'sd1200,
          "T2.2: Q amplified -300<<2 = -1200");

    // ---------------------------------------------------------------
    // TEST 3: Left shift with overflow → saturation
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 3: Left shift with saturation ---");

    gain_shift = 4'b0_011;  // left shift 3 = x8
    send_sample(16'sd10000, -16'sd10000);
    // 10000 << 3 = 80000 > 32767 → clamp to 32767
    // -10000 << 3 = -80000 < -32768 → clamp to -32768
    check(data_i_out == 16'sd32767,
          "T3.1: I saturated to +32767");
    check(data_q_out == -16'sd32768,
          "T3.2: Q saturated to -32768");
    check(saturation_count == 8'd1,
          "T3.3: Saturation counter = 1 (both channels clipped counts as 1)");

    // ---------------------------------------------------------------
    // TEST 4: Right shift (attenuate)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 4: Right shift (attenuate) ---");

    // Reset to clear saturation counter
    reset_n = 0;
    repeat (2) @(posedge clk);
    reset_n = 1;
    repeat (2) @(posedge clk);

    gain_shift = 4'b1_010;  // right shift 2 = /4
    send_sample(16'sd4000, -16'sd2000);
    check(data_i_out == 16'sd1000,
          "T4.1: I attenuated 4000>>2 = 1000");
    check(data_q_out == -16'sd500,
          "T4.2: Q attenuated -2000>>2 = -500");
    check(saturation_count == 8'd0,
          "T4.3: No saturation on right shift");

    // ---------------------------------------------------------------
    // TEST 5: Right shift preserves sign (arithmetic shift)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 5: Arithmetic right shift (sign preservation) ---");

    gain_shift = 4'b1_001;  // right shift 1
    send_sample(-16'sd1, -16'sd3);
    // -1 >>> 1 = -1 (sign extension)
    // -3 >>> 1 = -2 (floor division)
    check(data_i_out == -16'sd1,
          "T5.1: -1 >>> 1 = -1 (sign preserved)");
    check(data_q_out == -16'sd2,
          "T5.2: -3 >>> 1 = -2 (arithmetic floor)");

    // ---------------------------------------------------------------
    // TEST 6: Max left shift (7 bits)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 6: Max left shift (x128) ---");

    gain_shift = 4'b0_111;  // left shift 7 = x128
    send_sample(16'sd100, -16'sd50);
    // 100 << 7 = 12800 (no overflow)
    // -50 << 7 = -6400 (no overflow)
    check(data_i_out == 16'sd12800,
          "T6.1: 100 << 7 = 12800");
    check(data_q_out == -16'sd6400,
          "T6.2: -50 << 7 = -6400");

    // Now with values that overflow at max shift
    send_sample(16'sd300, 16'sd300);
    // 300 << 7 = 38400 > 32767 → saturate
    check(data_i_out == 16'sd32767,
          "T6.3: 300 << 7 saturates to +32767");

    // ---------------------------------------------------------------
    // TEST 7: Max right shift (7 bits)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 7: Max right shift (/128) ---");

    gain_shift = 4'b1_111;  // right shift 7 = /128
    send_sample(16'sd32767, -16'sd32768);
    // 32767 >>> 7 = 255
    // -32768 >>> 7 = -256
    check(data_i_out == 16'sd255,
          "T7.1: 32767 >>> 7 = 255");
    check(data_q_out == -16'sd256,
          "T7.2: -32768 >>> 7 = -256");

    // ---------------------------------------------------------------
    // TEST 8: Valid pipeline (1-cycle latency)
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 8: Valid pipeline ---");

    gain_shift = 4'b0_000;  // pass-through

    // Check that valid_out is low when we haven't sent anything
    @(posedge clk); #1;
    check(valid_out == 1'b0,
          "T8.1: valid_out low when no input");

    // Send a sample and check valid_out appears 1 cycle later
    @(negedge clk);
    data_i_in = 16'sd42;
    data_q_in = 16'sd43;
    valid_in  = 1'b1;
    @(posedge clk); #1;
    // This posedge just registered the input; valid_out should now be 1
    check(valid_out == 1'b1,
          "T8.2: valid_out asserts 1 cycle after valid_in");
    check(data_i_out == 16'sd42,
          "T8.3: data passes through with valid");

    @(negedge clk);
    valid_in = 1'b0;
    @(posedge clk); #1;
    check(valid_out == 1'b0,
          "T8.4: valid_out deasserts after valid_in drops");

    // ---------------------------------------------------------------
    // TEST 9: Dynamic gain change
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 9: Dynamic gain change ---");

    gain_shift = 4'b0_001;  // x2
    send_sample(16'sd1000, 16'sd1000);
    check(data_i_out == 16'sd2000,
          "T9.1: x2 gain applied");

    gain_shift = 4'b1_001;  // /2
    send_sample(16'sd1000, 16'sd1000);
    check(data_i_out == 16'sd500,
          "T9.2: /2 gain applied after change");

    // ---------------------------------------------------------------
    // TEST 10: Zero input
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 10: Zero input ---");

    gain_shift = 4'b0_111;  // max amplify
    send_sample(16'sd0, 16'sd0);
    check(data_i_out == 16'sd0,
          "T10.1: Zero stays zero at max gain");
    check(data_q_out == 16'sd0,
          "T10.2: Zero Q stays zero at max gain");

    // ---------------------------------------------------------------
    // TEST 11: Saturation counter stops at 255
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 11: Saturation counter caps at 255 ---");

    // Reset first
    reset_n = 0;
    repeat (2) @(posedge clk);
    reset_n = 1;
    repeat (2) @(posedge clk);

    gain_shift = 4'b0_111;  // x128 — will saturate most inputs
    // Send 256 saturating samples to overflow the counter
    begin : sat_loop
        integer j;
        for (j = 0; j < 256; j = j + 1) begin
            @(negedge clk);
            data_i_in = 16'sd20000;
            data_q_in = 16'sd20000;
            valid_in  = 1'b1;
            @(posedge clk);
        end
    end
    @(negedge clk);
    valid_in = 1'b0;
    @(posedge clk); #1;

    check(saturation_count == 8'd255,
          "T11.1: Counter capped at 255 after 256 saturating samples");

    // One more sample — should stay at 255
    send_sample(16'sd20000, 16'sd20000);
    check(saturation_count == 8'd255,
          "T11.2: Counter stays at 255 (no wrap)");

    // ---------------------------------------------------------------
    // TEST 12: Reset clears everything
    // ---------------------------------------------------------------
    $display("");
    $display("--- Test 12: Reset clears all ---");

    reset_n = 0;
    repeat (2) @(posedge clk);
    reset_n = 1;
    @(posedge clk); #1;

    check(data_i_out == 16'sd0,
          "T12.1: I output cleared on reset");
    check(data_q_out == 16'sd0,
          "T12.2: Q output cleared on reset");
    check(valid_out == 1'b0,
          "T12.3: valid_out cleared on reset");
    check(saturation_count == 8'd0,
          "T12.4: Saturation counter cleared on reset");

    // ---------------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------------
    $display("");
    $display("=== RX Gain Control: %0d passed, %0d failed ===",
             pass_count, fail_count);

    if (fail_count > 0)
        $display("[FAIL] RX gain control test FAILED");
    else
        $display("[PASS] All RX gain control tests passed");

    $finish;
end

endmodule
