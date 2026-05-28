`timescale 1ns / 1ps

/**
 * rx_gain_control.v
 *
 * Host-configurable digital gain control for the receive path.
 * Placed between DDC output (ddc_input_interface) and matched filter input.
 *
 * Features:
 *   - Bidirectional power-of-2 gain shift (arithmetic shift)
 *   - gain_shift[3]   = direction: 0 = left shift (amplify), 1 = right shift (attenuate)
 *   - gain_shift[2:0] = amount: 0..7 bits
 *   - Symmetric saturation to ±32767 on overflow (left shift only)
 *   - Saturation counter: 8-bit, counts samples that clipped (wraps at 255)
 *   - 1-cycle latency, valid-in/valid-out pipeline
 *   - Zero-overhead pass-through when gain_shift == 0
 *
 * Intended insertion point in radar_receiver_final.v:
 *   ddc_input_interface → rx_gain_control → matched_filter_multi_segment
 */

module rx_gain_control (
    input  wire        clk,
    input  wire        reset_n,

    // Data input (from DDC / ddc_input_interface)
    input  wire signed [15:0] data_i_in,
    input  wire signed [15:0] data_q_in,
    input  wire               valid_in,

    // Gain configuration (from host via USB command)
    // [3]   = direction: 0=amplify (left shift), 1=attenuate (right shift)
    // [2:0] = shift amount: 0..7 bits
    input  wire [3:0]  gain_shift,

    // Data output (to matched filter)
    output reg  signed [15:0] data_i_out,
    output reg  signed [15:0] data_q_out,
    output reg                valid_out,

    // Diagnostics
    output reg  [7:0]  saturation_count  // Number of clipped samples (wraps at 255)
);

// Decompose gain_shift
wire       shift_right = gain_shift[3];
wire [2:0] shift_amt   = gain_shift[2:0];

// -------------------------------------------------------------------------
// Combinational shift + saturation
// -------------------------------------------------------------------------
// Use wider intermediates to detect overflow on left shift.
// 24 bits is enough: 16 + 7 shift = 23 significant bits max.

wire signed [23:0] shifted_i;
wire signed [23:0] shifted_q;

assign shifted_i = shift_right ? (data_i_in >>> shift_amt)
                               : (data_i_in <<< shift_amt);
assign shifted_q = shift_right ? (data_q_in >>> shift_amt)
                               : (data_q_in <<< shift_amt);

// Saturation: clamp to signed 16-bit range [-32768, +32767]
wire overflow_i = (shifted_i > 24'sd32767) || (shifted_i < -24'sd32768);
wire overflow_q = (shifted_q > 24'sd32767) || (shifted_q < -24'sd32768);

wire signed [15:0] sat_i = overflow_i ? (shifted_i[23] ? -16'sd32768 : 16'sd32767)
                                      : shifted_i[15:0];
wire signed [15:0] sat_q = overflow_q ? (shifted_q[23] ? -16'sd32768 : 16'sd32767)
                                      : shifted_q[15:0];

// -------------------------------------------------------------------------
// Registered output stage (1-cycle latency)
// -------------------------------------------------------------------------
always @(posedge clk or negedge reset_n) begin
    if (!reset_n) begin
        data_i_out       <= 16'sd0;
        data_q_out       <= 16'sd0;
        valid_out        <= 1'b0;
        saturation_count <= 8'd0;
    end else begin
        valid_out <= valid_in;

        if (valid_in) begin
            data_i_out <= sat_i;
            data_q_out <= sat_q;

            // Count clipped samples (either channel clipping counts as 1)
            if ((overflow_i || overflow_q) && (saturation_count != 8'hFF))
                saturation_count <= saturation_count + 8'd1;
        end
    end
end

endmodule
