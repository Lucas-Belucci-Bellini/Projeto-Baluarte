import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib.patches as patches
from scipy import signal
from scipy.fft import fft, fftshift
from scipy.signal import butter, filtfilt
import logging
from dataclasses import dataclass
from typing import List, Dict, Tuple
import threading
import queue
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@dataclass
class RadarTarget:
    range: float
    velocity: float
    azimuth: int
    elevation: int
    snr: float
    chirp_type: str
    timestamp: float

class SignalProcessor:
    def __init__(self):
        self.range_resolution = 1.0  # meters
        self.velocity_resolution = 0.1  # m/s
        self.cfar_threshold = 15.0  # dB
        
    def doppler_fft(self, iq_data: np.ndarray, fs: float = 100e6) -> Tuple[np.ndarray, np.ndarray]:
        """
        Perform Doppler FFT on IQ data
        Returns Doppler frequencies and spectrum
        """
        # Window function for FFT
        window = np.hanning(len(iq_data))
        windowed_data = (iq_data['I_value'].values + 1j * iq_data['Q_value'].values) * window
        
        # Perform FFT
        doppler_fft = fft(windowed_data)
        doppler_fft = fftshift(doppler_fft)
        
        # Frequency axis
        N = len(iq_data)
        freq_axis = np.linspace(-fs/2, fs/2, N)
        
        # Convert to velocity (assuming radar frequency = 10 GHz)
        radar_freq = 10e9
        wavelength = 3e8 / radar_freq
        velocity_axis = freq_axis * wavelength / 2
        
        return velocity_axis, np.abs(doppler_fft)
    
    def mti_filter(self, iq_data: np.ndarray, filter_type: str = 'single_canceler') -> np.ndarray:
        """
        Moving Target Indicator filter
        Removes stationary clutter with better shape handling
        """
        if iq_data is None or len(iq_data) < 2:
            return np.array([], dtype=complex)
            
        try:
            # Ensure we're working with complex data
            complex_data = iq_data.astype(complex)
            
            if filter_type == 'single_canceler':
                # Single delay line canceler
                if len(complex_data) < 2:
                    return np.array([], dtype=complex)
                filtered = np.zeros(len(complex_data) - 1, dtype=complex)
                for i in range(1, len(complex_data)):
                    filtered[i-1] = complex_data[i] - complex_data[i-1]
                return filtered
                
            elif filter_type == 'double_canceler':
                # Double delay line canceler
                if len(complex_data) < 3:
                    return np.array([], dtype=complex)
                filtered = np.zeros(len(complex_data) - 2, dtype=complex)
                for i in range(2, len(complex_data)):
                    filtered[i-2] = complex_data[i] - 2*complex_data[i-1] + complex_data[i-2]
                return filtered
                
            else:
                return complex_data
        except Exception as e:
            logging.error(f"MTI filter error: {e}")
            return np.array([], dtype=complex)

    
    def cfar_detection(self, range_profile: np.ndarray, guard_cells: int = 2, 
                      training_cells: int = 10, threshold_factor: float = 3.0) -> List[Tuple[int, float]]:
        detections = []
        N = len(range_profile)
        
        # Ensure guard_cells and training_cells are integers
        guard_cells = int(guard_cells)
        training_cells = int(training_cells)
        
        for i in range(N):
            # Convert to integer indices
            i_int = int(i)
            if i_int < guard_cells + training_cells or i_int >= N - guard_cells - training_cells:
                continue
                
            # Leading window - ensure integer indices
            lead_start = i_int - guard_cells - training_cells
            lead_end = i_int - guard_cells
            lead_cells = range_profile[lead_start:lead_end]
            
            # Lagging window - ensure integer indices
            lag_start = i_int + guard_cells + 1
            lag_end = i_int + guard_cells + training_cells + 1
            lag_cells = range_profile[lag_start:lag_end]
            
            # Combine training cells
            training_cells_combined = np.concatenate([lead_cells, lag_cells])
            
            # Calculate noise floor (mean of training cells)
            if len(training_cells_combined) > 0:
                noise_floor = np.mean(training_cells_combined)
                
                # Apply threshold
                threshold = noise_floor * threshold_factor
                
                if range_profile[i_int] > threshold:
                    detections.append((i_int, float(range_profile[i_int])))  # Ensure float magnitude
        
        return detections
    
    def range_fft(self, iq_data: np.ndarray, fs: float = 100e6, bw: float = 20e6) -> Tuple[np.ndarray, np.ndarray]:
        """
        Perform range FFT on IQ data
        Returns range profile
        """
        # Window function
        window = np.hanning(len(iq_data))
        windowed_data = np.abs(iq_data) * window
        
        # Perform FFT
        range_fft = fft(windowed_data)
        
        # Range calculation
        N = len(iq_data)
        range_max = (3e8 * N) / (2 * bw)
        range_axis = np.linspace(0, range_max, N)
        
        return range_axis, np.abs(range_fft)
    
    def process_chirp_sequence(self, df: pd.DataFrame, chirp_type: str = 'LONG') -> Dict:
        try:
            # Filter data by chirp type
            chirp_data = df[df['chirp_type'] == chirp_type]
            
            if len(chirp_data) == 0:
                return {}
            
            # Group by chirp number
            chirp_numbers = chirp_data['chirp_number'].unique()
            num_chirps = len(chirp_numbers)
            
            if num_chirps == 0:
                return {}
            
            # Get samples per chirp and ensure consistency
            samples_per_chirp_list = [len(chirp_data[chirp_data['chirp_number'] == num]) 
                                    for num in chirp_numbers]
            
            # Use minimum samples to ensure consistent shape
            samples_per_chirp = min(samples_per_chirp_list)
            
            # Create range-Doppler matrix with consistent shape
            range_doppler_matrix = np.zeros((samples_per_chirp, num_chirps), dtype=complex)
            
            for i, chirp_num in enumerate(chirp_numbers):
                chirp_samples = chirp_data[chirp_data['chirp_number'] == chirp_num]
                # Take only the first samples_per_chirp samples to ensure consistent shape
                chirp_samples = chirp_samples.head(samples_per_chirp)
                
                # Create complex IQ data
                iq_data = chirp_samples['I_value'].values + 1j * chirp_samples['Q_value'].values
                
                # Ensure the shape matches
                if len(iq_data) == samples_per_chirp:
                    range_doppler_matrix[:, i] = iq_data
            
            # Apply MTI filter along slow-time (chirp-to-chirp)
            mti_filtered = np.zeros_like(range_doppler_matrix)
            for i in range(samples_per_chirp):
                slow_time_data = range_doppler_matrix[i, :]
                filtered = self.mti_filter(slow_time_data)
                # Ensure filtered data matches expected shape
                if len(filtered) == num_chirps:
                    mti_filtered[i, :] = filtered
                else:
                    # Handle shape mismatch by padding or truncating
                    if len(filtered) < num_chirps:
                        padded = np.zeros(num_chirps, dtype=complex)
                        padded[:len(filtered)] = filtered
                        mti_filtered[i, :] = padded
                    else:
                        mti_filtered[i, :] = filtered[:num_chirps]
            
            # Perform Doppler FFT along slow-time dimension
            doppler_fft_result = np.zeros((samples_per_chirp, num_chirps), dtype=complex)
            for i in range(samples_per_chirp):
                doppler_fft_result[i, :] = fft(mti_filtered[i, :])
            
            return {
                'range_doppler_matrix': np.abs(doppler_fft_result),
                'chirp_type': chirp_type,
                'num_chirps': num_chirps,
                'samples_per_chirp': samples_per_chirp
            }
        
        except Exception as e:
            logging.error(f"Error in process_chirp_sequence: {e}")
            return {}

class RadarGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Radar Signal Processor - CSV Analysis")
        self.root.geometry("1400x900")
        
        # Initialize processor
        self.processor = SignalProcessor()
        
        # Data storage
        self.df = None
        self.processed_data = {}
        self.detected_targets = []
        
        # Create GUI
        self.create_gui()
        
        # Start background processing
        self.processing_queue = queue.Queue()
        self.processing_thread = threading.Thread(target=self.background_processing, daemon=True)
        self.processing_thread.start()
        
        # Update GUI periodically
        self.root.after(100, self.update_gui)
    
    def create_gui(self):
        """Create the main GUI layout"""
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Control panel
        control_frame = ttk.LabelFrame(main_frame, text="File Controls")
        control_frame.pack(fill='x', pady=5)
        
        # File selection
        ttk.Button(control_frame, text="Load CSV File", 
                  command=self.load_csv_file).pack(side='left', padx=5, pady=5)
        
        self.file_label = ttk.Label(control_frame, text="No file loaded")
        self.file_label.pack(side='left', padx=10, pady=5)
        
        # Processing controls
        ttk.Button(control_frame, text="Process Data", 
                  command=self.process_data).pack(side='left', padx=5, pady=5)
        
        ttk.Button(control_frame, text="Run CFAR Detection", 
                  command=self.run_cfar_detection).pack(side='left', padx=5, pady=5)
        
        # Status
        self.status_label = ttk.Label(control_frame, text="Status: Ready")
        self.status_label.pack(side='right', padx=10, pady=5)
        
        # Display area
        display_frame = ttk.Frame(main_frame)
        display_frame.pack(fill='both', expand=True, pady=5)
        
        # Create matplotlib figures
        self.create_plots(display_frame)
        
        # Targets list
        targets_frame = ttk.LabelFrame(main_frame, text="Detected Targets")
        targets_frame.pack(fill='x', pady=5)
        
        self.targets_tree = ttk.Treeview(targets_frame, 
                                       columns=('Range', 'Velocity', 'Azimuth', 'Elevation', 'SNR', 'Chirp Type'), 
                                       show='headings', height=8)
        
        self.targets_tree.heading('Range', text='Range (m)')
        self.targets_tree.heading('Velocity', text='Velocity (m/s)')
        self.targets_tree.heading('Azimuth', text='Azimuth (°)')
        self.targets_tree.heading('Elevation', text='Elevation (°)')
        self.targets_tree.heading('SNR', text='SNR (dB)')
        self.targets_tree.heading('Chirp Type', text='Chirp Type')
        
        self.targets_tree.column('Range', width=100)
        self.targets_tree.column('Velocity', width=100)
        self.targets_tree.column('Azimuth', width=80)
        self.targets_tree.column('Elevation', width=80)
        self.targets_tree.column('SNR', width=80)
        self.targets_tree.column('Chirp Type', width=100)
        
        self.targets_tree.pack(fill='x', padx=5, pady=5)
    
    def create_plots(self, parent):
        """Create matplotlib plots"""
        # Create figure with subplots
        self.fig = Figure(figsize=(12, 8))
        self.canvas = FigureCanvasTkAgg(self.fig, parent)
        self.canvas.get_tk_widget().pack(fill='both', expand=True)
        
        # Create subplots
        self.ax1 = self.fig.add_subplot(221)  # Range profile
        self.ax2 = self.fig.add_subplot(222)  # Doppler spectrum
        self.ax3 = self.fig.add_subplot(223)  # Range-Doppler map
        self.ax4 = self.fig.add_subplot(224)  # MTI filtered data
        
        # Set titles
        self.ax1.set_title('Range Profile')
        self.ax1.set_xlabel('Range (m)')
        self.ax1.set_ylabel('Magnitude')
        self.ax1.grid(True)
        
        self.ax2.set_title('Doppler Spectrum')
        self.ax2.set_xlabel('Velocity (m/s)')
        self.ax2.set_ylabel('Magnitude')
        self.ax2.grid(True)
        
        self.ax3.set_title('Range-Doppler Map')
        self.ax3.set_xlabel('Doppler Bin')
        self.ax3.set_ylabel('Range Bin')
        
        self.ax4.set_title('MTI Filtered Data')
        self.ax4.set_xlabel('Sample')
        self.ax4.set_ylabel('Magnitude')
        self.ax4.grid(True)
        
        self.fig.tight_layout()
    
    def load_csv_file(self):
        """Load CSV file generated by testbench"""
        filename = filedialog.askopenfilename(
            title="Select CSV file",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
    
    # Add magnitude and phase calculations after loading CSV
        if self.df is not None:
            # Calculate magnitude from I/Q values
            self.df['magnitude'] = np.sqrt(self.df['I_value']**2 + self.df['Q_value']**2)
            
            # Calculate phase from I/Q values  
            self.df['phase_rad'] = np.arctan2(self.df['Q_value'], self.df['I_value'])
            
            # If you used magnitude_squared in CSV, calculate actual magnitude
            if 'magnitude_squared' in self.df.columns:
                self.df['magnitude'] = np.sqrt(self.df['magnitude_squared'])
        if filename:
            try:
                self.status_label.config(text="Status: Loading CSV file...")
                self.df = pd.read_csv(filename)
                self.file_label.config(text=f"Loaded: {filename.split('/')[-1]}")
                self.status_label.config(text=f"Status: Loaded {len(self.df)} samples")
                
                # Show basic info
                self.show_file_info()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load CSV file: {e}")
                self.status_label.config(text="Status: Error loading file")
    
    def show_file_info(self):
        """Display basic information about loaded data"""
        if self.df is not None:
            info_text = f"Samples: {len(self.df)} | "
            info_text += f"Chirps: {self.df['chirp_number'].nunique()} | "
            info_text += f"Long: {len(self.df[self.df['chirp_type'] == 'LONG'])} | "
            info_text += f"Short: {len(self.df[self.df['chirp_type'] == 'SHORT'])}"
            
            self.file_label.config(text=info_text)
    
    def process_data(self):
        """Process loaded CSV data"""
        if self.df is None:
            messagebox.showwarning("Warning", "Please load a CSV file first")
            return
        
        self.status_label.config(text="Status: Processing data...")
        
        # Add to processing queue
        self.processing_queue.put(('process', self.df))
    
    def run_cfar_detection(self):
        """Run CFAR detection on processed data"""
        if self.df is None:
            messagebox.showwarning("Warning", "Please load and process data first")
            return
        
        self.status_label.config(text="Status: Running CFAR detection...")
        self.processing_queue.put(('cfar', self.df))
    
    def background_processing(self):

        while True:
            try:
                task_type, data = self.processing_queue.get(timeout=1.0)
                
                if task_type == 'process':
                    self._process_data_background(data)
                elif task_type == 'cfar':
                    self._run_cfar_background(data)
                else:
                    logging.warning(f"Unknown task type: {task_type}")
                    
                self.processing_queue.task_done()
                    
            except queue.Empty:
                continue
            except Exception as e:
                logging.error(f"Background processing error: {e}")
                # Update GUI to show error state
                self.root.after(0, lambda: self.status_label.config(
                    text=f"Status: Processing error - {e}"
                ))
    
    def _process_data_background(self, df):
        try:
            # Process long chirps
            long_chirp_data = self.processor.process_chirp_sequence(df, 'LONG')
            
            # Process short chirps
            short_chirp_data = self.processor.process_chirp_sequence(df, 'SHORT')
            
            # Store results
            self.processed_data = {
                'long': long_chirp_data,
                'short': short_chirp_data
            }
            
            # Update GUI in main thread
            self.root.after(0, self._update_plots_after_processing)
        
        except Exception as e:
            logging.error(f"Processing error: {e}")
            error_msg = str(e)
            self.root.after(0, lambda msg=error_msg: self.status_label.config(
                text=f"Status: Processing error - {msg}"
            ))
    
    def _run_cfar_background(self, df):
        try:
            # Get first chirp for CFAR demonstration
            first_chirp = df[df['chirp_number'] == df['chirp_number'].min()]
            
            if len(first_chirp) == 0:
                return
            
            # Create IQ data - FIXED TYPO: first_chirp not first_chip
            iq_data = first_chirp['I_value'].values + 1j * first_chirp['Q_value'].values
            
            # Perform range FFT
            range_axis, range_profile = self.processor.range_fft(iq_data)
            
            # Run CFAR detection
            detections = self.processor.cfar_detection(range_profile)
            
            # Convert to target objects
            self.detected_targets = []
            for range_bin, magnitude in detections:
                target = RadarTarget(
                    range=range_axis[range_bin],
                    velocity=0,  # Would need Doppler processing for velocity
                    azimuth=0,   # From actual data
                    elevation=0, # From actual data
                    snr=20 * np.log10(magnitude + 1e-9),  # Convert to dB
                    chirp_type='LONG',
                    timestamp=time.time()
                )
                self.detected_targets.append(target)
            
            # Update GUI in main thread
            self.root.after(0, lambda: self._update_cfar_results(range_axis, range_profile, detections))
            
        except Exception as e:
            logging.error(f"CFAR detection error: {e}")
            error_msg = str(e)
            self.root.after(0, lambda msg=error_msg: self.status_label.config(
                text=f"Status: CFAR error - {msg}"
            ))
    
    def _update_plots_after_processing(self):
        try:
            # Clear all plots
            for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
                ax.clear()
            
            # Plot 1: Range profile from first chirp
            if self.df is not None and len(self.df) > 0:
                try:
                    first_chirp_num = self.df['chirp_number'].min()
                    first_chirp = self.df[self.df['chirp_number'] == first_chirp_num]
                    
                    if len(first_chirp) > 0:
                        iq_data = first_chirp['I_value'].values + 1j * first_chirp['Q_value'].values
                        range_axis, range_profile = self.processor.range_fft(iq_data)
                        
                        if len(range_axis) > 0 and len(range_profile) > 0:
                            self.ax1.plot(range_axis, range_profile, 'b-')
                            self.ax1.set_title('Range Profile - First Chirp')
                            self.ax1.set_xlabel('Range (m)')
                            self.ax1.set_ylabel('Magnitude')
                            self.ax1.grid(True)
                except Exception as e:
                    logging.warning(f"Range profile plot error: {e}")
                    self.ax1.set_title('Range Profile - Error')
            
            # Plot 2: Doppler spectrum
            if self.df is not None and len(self.df) > 0:
                try:
                    sample_data = self.df.head(1024)
                    if len(sample_data) > 10:
                        iq_data = sample_data['I_value'].values + 1j * sample_data['Q_value'].values
                        velocity_axis, doppler_spectrum = self.processor.doppler_fft(iq_data)
                        
                        if len(velocity_axis) > 0 and len(doppler_spectrum) > 0:
                            self.ax2.plot(velocity_axis, doppler_spectrum, 'g-')
                            self.ax2.set_title('Doppler Spectrum')
                            self.ax2.set_xlabel('Velocity (m/s)')
                            self.ax2.set_ylabel('Magnitude')
                            self.ax2.grid(True)
                except Exception as e:
                    logging.warning(f"Doppler spectrum plot error: {e}")
                    self.ax2.set_title('Doppler Spectrum - Error')
            
            # Plot 3: Range-Doppler map
            if (self.processed_data.get('long') and 
                'range_doppler_matrix' in self.processed_data['long'] and
                self.processed_data['long']['range_doppler_matrix'].size > 0):
                
                try:
                    rd_matrix = self.processed_data['long']['range_doppler_matrix']
                    # Use integer indices for extent
                    extent = [0, int(rd_matrix.shape[1]), 0, int(rd_matrix.shape[0])]
                    
                    im = self.ax3.imshow(10 * np.log10(rd_matrix + 1e-9), 
                                       aspect='auto', cmap='hot',
                                       extent=extent)
                    self.ax3.set_title('Range-Doppler Map (Long Chirps)')
                    self.ax3.set_xlabel('Doppler Bin')
                    self.ax3.set_ylabel('Range Bin')
                    self.fig.colorbar(im, ax=self.ax3, label='dB')
                except Exception as e:
                    logging.warning(f"Range-Doppler map plot error: {e}")
                    self.ax3.set_title('Range-Doppler Map - Error')
            
            # Plot 4: MTI filtered data
            if self.df is not None and len(self.df) > 0:
                try:
                    sample_data = self.df.head(100)
                    if len(sample_data) > 10:
                        iq_data = sample_data['I_value'].values + 1j * sample_data['Q_value'].values
                        
                        # Original data
                        original_mag = np.abs(iq_data)
                        
                        # MTI filtered
                        mti_filtered = self.processor.mti_filter(iq_data)
                        
                        if mti_filtered is not None and len(mti_filtered) > 0:
                            mti_mag = np.abs(mti_filtered)
                            
                            # Use integer indices for plotting
                            x_original = np.arange(len(original_mag))
                            x_mti = np.arange(len(mti_mag))
                            
                            self.ax4.plot(x_original, original_mag, 'b-', label='Original', alpha=0.7)
                            self.ax4.plot(x_mti, mti_mag, 'r-', label='MTI Filtered', alpha=0.7)
                            self.ax4.set_title('MTI Filter Comparison')
                            self.ax4.set_xlabel('Sample Index')
                            self.ax4.set_ylabel('Magnitude')
                            self.ax4.legend()
                            self.ax4.grid(True)
                except Exception as e:
                    logging.warning(f"MTI filter plot error: {e}")
                    self.ax4.set_title('MTI Filter - Error')
            
            # Adjust layout and draw
            self.fig.tight_layout()
            self.canvas.draw()
            self.status_label.config(text="Status: Processing complete")
            
        except Exception as e:
            logging.error(f"Plot update error: {e}")
            error_msg = str(e)
            self.status_label.config(text=f"Status: Plot error - {error_msg}")
    
    def _update_cfar_results(self, range_axis, range_profile, detections):
        try:
            # Clear the plot
            self.ax1.clear()
            
            # Plot range profile
            self.ax1.plot(range_axis, range_profile, 'b-', label='Range Profile')
            
            # Plot detections - ensure we use integer indices
            if detections and len(range_axis) > 0:
                detection_ranges = []
                detection_mags = []
                
                for bin_idx, mag in detections:
                    # Convert bin_idx to integer and ensure it's within bounds
                    bin_idx_int = int(bin_idx)
                    if 0 <= bin_idx_int < len(range_axis):
                        detection_ranges.append(range_axis[bin_idx_int])
                        detection_mags.append(mag)
                
                if detection_ranges:  # Only plot if we have valid detections
                    self.ax1.plot(detection_ranges, detection_mags, 'ro', 
                                markersize=8, label='CFAR Detections')
            
            self.ax1.set_title('Range Profile with CFAR Detections')
            self.ax1.set_xlabel('Range (m)')
            self.ax1.set_ylabel('Magnitude')
            self.ax1.legend()
            self.ax1.grid(True)
            
            # Update targets list
            self.update_targets_list()
            
            self.canvas.draw()
            self.status_label.config(text=f"Status: CFAR complete - {len(detections)} targets detected")
            
        except Exception as e:
            logging.error(f"CFAR results update error: {e}")
            error_msg = str(e)
            self.status_label.config(text=f"Status: CFAR results error - {error_msg}")
    
    def update_targets_list(self):
        """Update the targets list display"""
        # Clear current list
        for item in self.targets_tree.get_children():
            self.targets_tree.delete(item)
        
        # Add detected targets
        for i, target in enumerate(self.detected_targets):
            self.targets_tree.insert('', 'end', values=(
                f"{target.range:.1f}",
                f"{target.velocity:.1f}",
                f"{target.azimuth}",
                f"{target.elevation}",
                f"{target.snr:.1f}",
                target.chirp_type
            ))
    
    def update_gui(self):
        """Periodic GUI update"""
        # You can add any periodic updates here
        self.root.after(100, self.update_gui)

def main():
    """Main application entry point"""
    try:
        root = tk.Tk()
        app = RadarGUI(root)
        root.mainloop()
    except Exception as e:
        logging.error(f"Application error: {e}")
        messagebox.showerror("Fatal Error", f"Application failed to start: {e}")

if __name__ == "__main__":
    main()
