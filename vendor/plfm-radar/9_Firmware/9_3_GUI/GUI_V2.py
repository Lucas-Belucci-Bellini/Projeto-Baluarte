import tkinter as tk
from tkinter import ttk, messagebox
import threading
import queue
import time
import struct
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import logging
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from scipy import signal
from sklearn.cluster import DBSCAN
from filterpy.kalman import KalmanFilter
import crcmod
import math

try:
    import usb.core
    import usb.util
    USB_AVAILABLE = True
except ImportError:
    USB_AVAILABLE = False
    logging.warning("pyusb not available. USB CDC functionality will be disabled.")

try:
    from pyftdi.ftdi import Ftdi
    from pyftdi.usbtools import UsbTools
    FTDI_AVAILABLE = True
except ImportError:
    FTDI_AVAILABLE = False
    logging.warning("pyftdi not available. FTDI functionality will be disabled.")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@dataclass
class RadarTarget:
    id: int
    range: float
    velocity: float
    azimuth: int
    elevation: int
    snr: float
    timestamp: float
    track_id: int = -1

@dataclass
class RadarSettings:
    system_frequency: float = 10e9
    chirp_duration: float = 30e-6
    chirps_per_position: int = 32
    freq_min: float = 10e6
    freq_max: float = 30e6
    prf1: float = 1000
    prf2: float = 2000
    max_distance: float = 50000

@dataclass
class GPSData:
    latitude: float
    longitude: float
    altitude: float
    timestamp: float

class STM32USBInterface:
    def __init__(self):
        self.device = None
        self.is_open = False
        self.ep_in = None
        self.ep_out = None
        
    def list_devices(self):
        """List available STM32 USB CDC devices"""
        if not USB_AVAILABLE:
            logging.warning("USB not available - please install pyusb")
            return []
            
        try:
            devices = []
            # STM32 USB CDC devices typically use these vendor/product IDs
            stm32_vid_pids = [
                (0x0483, 0x5740),  # STM32 Virtual COM Port
                (0x0483, 0x3748),  # STM32 Discovery
                (0x0483, 0x374B),  # STM32 CDC
                (0x0483, 0x374D),  # STM32 CDC
                (0x0483, 0x374E),  # STM32 CDC
                (0x0483, 0x3752),  # STM32 CDC
            ]
            
            for vid, pid in stm32_vid_pids:
                found_devices = usb.core.find(find_all=True, idVendor=vid, idProduct=pid)
                for dev in found_devices:
                    try:
                        product = usb.util.get_string(dev, dev.iProduct) if dev.iProduct else "STM32 CDC"
                        serial = usb.util.get_string(dev, dev.iSerialNumber) if dev.iSerialNumber else "Unknown"
                        devices.append({
                            'description': f"{product} ({serial})",
                            'vendor_id': vid,
                            'product_id': pid,
                            'device': dev
                        })
                    except:
                        devices.append({
                            'description': f"STM32 CDC (VID:{vid:04X}, PID:{pid:04X})",
                            'vendor_id': vid,
                            'product_id': pid,
                            'device': dev
                        })
            
            return devices
        except Exception as e:
            logging.error(f"Error listing USB devices: {e}")
            # Return mock devices for testing
            return [{'description': 'STM32 Virtual COM Port', 'vendor_id': 0x0483, 'product_id': 0x5740}]
    
    def open_device(self, device_info):
        """Open STM32 USB CDC device"""
        if not USB_AVAILABLE:
            logging.error("USB not available - cannot open device")
            return False
            
        try:
            self.device = device_info['device']
            
            # Detach kernel driver if active
            if self.device.is_kernel_driver_active(0):
                self.device.detach_kernel_driver(0)
            
            # Set configuration
            self.device.set_configuration()
            
            # Get CDC endpoints
            cfg = self.device.get_active_configuration()
            intf = cfg[(0,0)]
            
            # Find bulk endpoints (CDC data interface)
            self.ep_out = usb.util.find_descriptor(
                intf,
                custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT
            )
            
            self.ep_in = usb.util.find_descriptor(
                intf,
                custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN
            )
            
            if self.ep_out is None or self.ep_in is None:
                logging.error("Could not find CDC endpoints")
                return False
            
            self.is_open = True
            logging.info(f"STM32 USB device opened: {device_info['description']}")
            return True
            
        except Exception as e:
            logging.error(f"Error opening USB device: {e}")
            return False
    
    def send_start_flag(self):
        """Step 12: Send start flag to STM32 via USB"""
        start_packet = bytes([23, 46, 158, 237])
        logging.info("Sending start flag to STM32 via USB...")
        return self._send_data(start_packet)
    
    def send_settings(self, settings):
        """Step 13: Send radar settings to STM32 via USB"""
        try:
            packet = self._create_settings_packet(settings)
            logging.info("Sending radar settings to STM32 via USB...")
            return self._send_data(packet)
        except Exception as e:
            logging.error(f"Error sending settings via USB: {e}")
            return False
    
    def read_data(self, size=64, timeout=1000):
        """Read data from STM32 via USB"""
        if not self.is_open or self.ep_in is None:
            return None
            
        try:
            data = self.ep_in.read(size, timeout=timeout)
            return bytes(data)
        except usb.core.USBError as e:
            if e.errno == 110:  # Timeout
                return None
            logging.error(f"USB read error: {e}")
            return None
        except Exception as e:
            logging.error(f"Error reading from USB: {e}")
            return None
    
    def _send_data(self, data):
        """Send data to STM32 via USB"""
        if not self.is_open or self.ep_out is None:
            return False
            
        try:
            # USB CDC typically uses 64-byte packets
            packet_size = 64
            for i in range(0, len(data), packet_size):
                chunk = data[i:i + packet_size]
                # Pad to packet size if needed
                if len(chunk) < packet_size:
                    chunk += b'\x00' * (packet_size - len(chunk))
                self.ep_out.write(chunk)
            
            return True
        except Exception as e:
            logging.error(f"Error sending data via USB: {e}")
            return False
    
    def _create_settings_packet(self, settings):
        """Create binary settings packet for USB transmission"""
        packet = b'SET'
        packet += struct.pack('>d', settings.system_frequency)
        packet += struct.pack('>d', settings.chirp_duration)
        packet += struct.pack('>I', settings.chirps_per_position)
        packet += struct.pack('>d', settings.freq_min)
        packet += struct.pack('>d', settings.freq_max)
        packet += struct.pack('>d', settings.prf1)
        packet += struct.pack('>d', settings.prf2)
        packet += struct.pack('>d', settings.max_distance)
        packet += b'END'
        return packet
    
    def close(self):
        """Close USB device"""
        if self.device and self.is_open:
            try:
                usb.util.dispose_resources(self.device)
                self.is_open = False
            except Exception as e:
                logging.error(f"Error closing USB device: {e}")

class FTDIInterface:
    def __init__(self):
        self.ftdi = None
        self.is_open = False
        
    def list_devices(self):
        """List available FTDI devices using pyftdi"""
        if not FTDI_AVAILABLE:
            logging.warning("FTDI not available - please install pyftdi")
            return []
            
        try:
            devices = []
            # Get list of all FTDI devices
            for device in UsbTools.find_all([(0x0403, 0x6010)]):  # FT2232H vendor/product ID
                devices.append({
                    'description': f"FTDI Device {device}",
                    'url': f"ftdi://{device}/1"
                })
            return devices
        except Exception as e:
            logging.error(f"Error listing FTDI devices: {e}")
            # Return mock devices for testing
            return [{'description': 'FT2232H Device A', 'url': 'ftdi://device/1'}]
    
    def open_device(self, device_url):
        """Open FTDI device using pyftdi"""
        if not FTDI_AVAILABLE:
            logging.error("FTDI not available - cannot open device")
            return False
            
        try:
            self.ftdi = Ftdi()
            self.ftdi.open_from_url(device_url)
            
            # Configure for synchronous FIFO mode
            self.ftdi.set_bitmode(0xFF, Ftdi.BitMode.SYNCFF)
            
            # Set latency timer
            self.ftdi.set_latency_timer(2)
            
            # Purge buffers
            self.ftdi.purge_buffers()
            
            self.is_open = True
            logging.info(f"FTDI device opened: {device_url}")
            return True
            
        except Exception as e:
            logging.error(f"Error opening FTDI device: {e}")
            return False
    
    def read_data(self, bytes_to_read):
        """Read data from FTDI"""
        if not self.is_open or self.ftdi is None:
            return None
            
        try:
            data = self.ftdi.read_data(bytes_to_read)
            if data:
                return bytes(data)
            return None
        except Exception as e:
            logging.error(f"Error reading from FTDI: {e}")
            return None
    
    def close(self):
        """Close FTDI device"""
        if self.ftdi and self.is_open:
            self.ftdi.close()
            self.is_open = False

class RadarProcessor:
    def __init__(self):
        self.range_doppler_map = np.zeros((1024, 32))
        self.detected_targets = []
        self.track_id_counter = 0
        self.tracks = {}
        self.frame_count = 0
        
    def dual_cpi_fusion(self, range_profiles_1, range_profiles_2):
        """Dual-CPI fusion for better detection"""
        fused_profile = np.mean(range_profiles_1, axis=0) + np.mean(range_profiles_2, axis=0)
        return fused_profile
    
    def multi_prf_unwrap(self, doppler_measurements, prf1, prf2):
        """Multi-PRF velocity unwrapping"""
        lambda_wavelength = 3e8 / 10e9
        v_max1 = prf1 * lambda_wavelength / 2
        v_max2 = prf2 * lambda_wavelength / 2
        
        unwrapped_velocities = []
        for doppler in doppler_measurements:
            v1 = doppler * lambda_wavelength / 2
            v2 = doppler * lambda_wavelength / 2
            
            velocity = self._solve_chinese_remainder(v1, v2, v_max1, v_max2)
            unwrapped_velocities.append(velocity)
            
        return unwrapped_velocities
    
    def _solve_chinese_remainder(self, v1, v2, max1, max2):
        for k in range(-5, 6):
            candidate = v1 + k * max1
            if abs(candidate - v2) < max2 / 2:
                return candidate
        return v1
    
    def clustering(self, detections, eps=100, min_samples=2):
        """DBSCAN clustering of detections"""
        if len(detections) == 0:
            return []
            
        points = np.array([[d.range, d.velocity] for d in detections])
        clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(points)
        
        clusters = []
        for label in set(clustering.labels_):
            if label != -1:
                cluster_points = points[clustering.labels_ == label]
                clusters.append({
                    'center': np.mean(cluster_points, axis=0),
                    'points': cluster_points,
                    'size': len(cluster_points)
                })
                
        return clusters
    
    def association(self, detections, clusters):
        """Association of detections to tracks"""
        associated_detections = []
        
        for detection in detections:
            best_track = None
            min_distance = float('inf')
            
            for track_id, track in self.tracks.items():
                distance = np.sqrt(
                    (detection.range - track['state'][0])**2 +
                    (detection.velocity - track['state'][2])**2
                )
                
                if distance < min_distance and distance < 500:
                    min_distance = distance
                    best_track = track_id
            
            if best_track is not None:
                detection.track_id = best_track
                associated_detections.append(detection)
            else:
                detection.track_id = self.track_id_counter
                self.track_id_counter += 1
                associated_detections.append(detection)
                
        return associated_detections
    
    def tracking(self, associated_detections):
        """Kalman filter tracking"""
        current_time = time.time()
        
        for detection in associated_detections:
            if detection.track_id not in self.tracks:
                kf = KalmanFilter(dim_x=4, dim_z=2)
                kf.x = np.array([detection.range, 0, detection.velocity, 0])
                kf.F = np.array([[1, 1, 0, 0],
                               [0, 1, 0, 0],
                               [0, 0, 1, 1],
                               [0, 0, 0, 1]])
                kf.H = np.array([[1, 0, 0, 0],
                               [0, 0, 1, 0]])
                kf.P *= 1000
                kf.R = np.diag([10, 1])
                kf.Q = np.eye(4) * 0.1
                
                self.tracks[detection.track_id] = {
                    'filter': kf,
                    'state': kf.x,
                    'last_update': current_time,
                    'hits': 1
                }
            else:
                track = self.tracks[detection.track_id]
                track['filter'].predict()
                track['filter'].update([detection.range, detection.velocity])
                track['state'] = track['filter'].x
                track['last_update'] = current_time
                track['hits'] += 1
        
        stale_tracks = [tid for tid, track in self.tracks.items() 
                       if current_time - track['last_update'] > 5.0]
        for tid in stale_tracks:
            del self.tracks[tid]

class USBPacketParser:
    def __init__(self):
        self.crc16_func = crcmod.mkCrcFun(0x11021, rev=False, initCrc=0xFFFF, xorOut=0x0000)
        
    def parse_gps_data(self, data):
        """Parse GPS data from STM32 USB CDC"""
        if not data:
            return None
            
        try:
            # Try text format first: "GPS:lat,lon,alt\r\n"
            text_data = data.decode('utf-8', errors='ignore').strip()
            if text_data.startswith('GPS:'):
                parts = text_data.split(':')[1].split(',')
                if len(parts) == 3:
                    lat = float(parts[0])
                    lon = float(parts[1])
                    alt = float(parts[2])
                    return GPSData(latitude=lat, longitude=lon, altitude=alt, timestamp=time.time())
            
            # Try binary format
            if len(data) >= 26 and data[0:4] == b'GPSB':
                return self._parse_binary_gps(data)
                
        except Exception as e:
            logging.error(f"Error parsing GPS data: {e}")
            
        return None
    
    def _parse_binary_gps(self, data):
        """Parse binary GPS format"""
        try:
            # Binary format: [Header 4][Latitude 8][Longitude 8][Altitude 4][CRC 2]
            if len(data) < 26:
                return None
                
            # Verify CRC (simple checksum)
            crc_received = (data[24] << 8) | data[25]
            crc_calculated = sum(data[0:24]) & 0xFFFF
            
            if crc_received != crc_calculated:
                logging.warning("GPS CRC mismatch")
                return None
            
            # Parse latitude (double, big-endian)
            lat_bits = 0
            for i in range(8):
                lat_bits = (lat_bits << 8) | data[4 + i]
            latitude = struct.unpack('>d', struct.pack('>Q', lat_bits))[0]
            
            # Parse longitude (double, big-endian)
            lon_bits = 0
            for i in range(8):
                lon_bits = (lon_bits << 8) | data[12 + i]
            longitude = struct.unpack('>d', struct.pack('>Q', lon_bits))[0]
            
            # Parse altitude (float, big-endian)
            alt_bits = 0
            for i in range(4):
                alt_bits = (alt_bits << 8) | data[20 + i]
            altitude = struct.unpack('>f', struct.pack('>I', alt_bits))[0]
            
            return GPSData(latitude=latitude, longitude=longitude, altitude=altitude, timestamp=time.time())
            
        except Exception as e:
            logging.error(f"Error parsing binary GPS: {e}")
            return None

class RadarPacketParser:
    def __init__(self):
        self.sync_pattern = b'\xA5\xC3'
        self.crc16_func = crcmod.mkCrcFun(0x11021, rev=False, initCrc=0xFFFF, xorOut=0x0000)
        
    def parse_packet(self, data):
        if len(data) < 6:
            return None
            
        sync_index = data.find(self.sync_pattern)
        if sync_index == -1:
            return None
            
        packet = data[sync_index:]
        
        if len(packet) < 6:
            return None
            
        sync = packet[0:2]
        packet_type = packet[2]
        length = packet[3]
        
        if len(packet) < (4 + length + 2):
            return None
            
        payload = packet[4:4+length]
        crc_received = struct.unpack('<H', packet[4+length:4+length+2])[0]
        
        crc_calculated = self.calculate_crc(packet[0:4+length])
        if crc_calculated != crc_received:
            logging.warning(f"CRC mismatch: got {crc_received:04X}, calculated {crc_calculated:04X}")
            return None
        
        if packet_type == 0x01:
            return self.parse_range_packet(payload)
        elif packet_type == 0x02:
            return self.parse_doppler_packet(payload)
        elif packet_type == 0x03:
            return self.parse_detection_packet(payload)
        else:
            logging.warning(f"Unknown packet type: {packet_type:02X}")
            return None
    
    def calculate_crc(self, data):
        return self.crc16_func(data)
    
    def parse_range_packet(self, payload):
        if len(payload) < 12:
            return None
            
        try:
            range_value = struct.unpack('>I', payload[0:4])[0]
            elevation = payload[4] & 0x1F
            azimuth = payload[5] & 0x3F
            chirp_counter = payload[6] & 0x1F
            
            return {
                'type': 'range',
                'range': range_value,
                'elevation': elevation,
                'azimuth': azimuth,
                'chirp': chirp_counter,
                'timestamp': time.time()
            }
        except Exception as e:
            logging.error(f"Error parsing range packet: {e}")
            return None
    
    def parse_doppler_packet(self, payload):
        if len(payload) < 12:
            return None
            
        try:
            doppler_real = struct.unpack('>h', payload[0:2])[0]
            doppler_imag = struct.unpack('>h', payload[2:4])[0]
            elevation = payload[4] & 0x1F
            azimuth = payload[5] & 0x3F
            chirp_counter = payload[6] & 0x1F
            
            return {
                'type': 'doppler',
                'doppler_real': doppler_real,
                'doppler_imag': doppler_imag,
                'elevation': elevation,
                'azimuth': azimuth,
                'chirp': chirp_counter,
                'timestamp': time.time()
            }
        except Exception as e:
            logging.error(f"Error parsing Doppler packet: {e}")
            return None
    
    def parse_detection_packet(self, payload):
        if len(payload) < 8:
            return None
            
        try:
            detection_flag = (payload[0] & 0x01) != 0
            elevation = payload[1] & 0x1F
            azimuth = payload[2] & 0x3F
            chirp_counter = payload[3] & 0x1F
            
            return {
                'type': 'detection',
                'detected': detection_flag,
                'elevation': elevation,
                'azimuth': azimuth,
                'chirp': chirp_counter,
                'timestamp': time.time()
            }
        except Exception as e:
            logging.error(f"Error parsing detection packet: {e}")
            return None

class RadarGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Advanced Radar System GUI - USB CDC")
        self.root.geometry("1400x900")
        
        # Initialize interfaces
        self.stm32_usb_interface = STM32USBInterface()
        self.ftdi_interface = FTDIInterface()
        self.radar_processor = RadarProcessor()
        self.usb_packet_parser = USBPacketParser()
        self.radar_packet_parser = RadarPacketParser()
        self.settings = RadarSettings()
        
        # Data queues
        self.radar_data_queue = queue.Queue()
        self.gps_data_queue = queue.Queue()
        
        # Thread control
        self.running = False
        self.radar_thread = None
        self.gps_thread = None
        
        # Counters
        self.received_packets = 0
        self.current_gps = GPSData(latitude=41.9028, longitude=12.4964, altitude=0, timestamp=0)
        
        self.create_gui()
        self.start_background_threads()
    
    def create_gui(self):
        """Create the main GUI with tabs"""
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        self.tab_main = ttk.Frame(self.notebook)
        self.tab_map = ttk.Frame(self.notebook)
        self.tab_diagnostics = ttk.Frame(self.notebook)
        self.tab_settings = ttk.Frame(self.notebook)
        
        self.notebook.add(self.tab_main, text='Main View')
        self.notebook.add(self.tab_map, text='Map View')
        self.notebook.add(self.tab_diagnostics, text='Diagnostics')
        self.notebook.add(self.tab_settings, text='Settings')
        
        self.setup_main_tab()
        self.setup_map_tab()
        self.setup_settings_tab()
    
    def setup_main_tab(self):
        """Setup the main radar display tab"""
        # Control frame
        control_frame = ttk.Frame(self.tab_main)
        control_frame.pack(fill='x', padx=10, pady=5)
        
        # USB Device selection
        ttk.Label(control_frame, text="STM32 USB Device:").grid(row=0, column=0, padx=5)
        self.stm32_usb_combo = ttk.Combobox(control_frame, state="readonly", width=40)
        self.stm32_usb_combo.grid(row=0, column=1, padx=5)
        
        ttk.Label(control_frame, text="FTDI Device:").grid(row=0, column=2, padx=5)
        self.ftdi_combo = ttk.Combobox(control_frame, state="readonly", width=30)
        self.ftdi_combo.grid(row=0, column=3, padx=5)
        
        ttk.Button(control_frame, text="Refresh Devices", 
                  command=self.refresh_devices).grid(row=0, column=4, padx=5)
        
        self.start_button = ttk.Button(control_frame, text="Start Radar", 
                                      command=self.start_radar)
        self.start_button.grid(row=0, column=5, padx=5)
        
        self.stop_button = ttk.Button(control_frame, text="Stop Radar", 
                                     command=self.stop_radar, state="disabled")
        self.stop_button.grid(row=0, column=6, padx=5)
        
        # GPS info
        self.gps_label = ttk.Label(control_frame, text="GPS: Waiting for data...")
        self.gps_label.grid(row=1, column=0, columnspan=4, sticky='w', padx=5, pady=2)
        
        # Status info
        self.status_label = ttk.Label(control_frame, text="Status: Ready")
        self.status_label.grid(row=1, column=4, columnspan=3, sticky='e', padx=5, pady=2)
        
        # Main display area
        display_frame = ttk.Frame(self.tab_main)
        display_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Range-Doppler Map
        fig = Figure(figsize=(10, 6))
        self.range_doppler_ax = fig.add_subplot(111)
        self.range_doppler_plot = self.range_doppler_ax.imshow(
            np.random.rand(1024, 32), aspect='auto', cmap='hot', 
            extent=[0, 32, 0, 1024])
        self.range_doppler_ax.set_title('Range-Doppler Map')
        self.range_doppler_ax.set_xlabel('Doppler Bin')
        self.range_doppler_ax.set_ylabel('Range Bin')
        
        self.canvas = FigureCanvasTkAgg(fig, display_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(side='left', fill='both', expand=True)
        
        # Targets list
        targets_frame = ttk.LabelFrame(display_frame, text="Detected Targets")
        targets_frame.pack(side='right', fill='y', padx=5)
        
        self.targets_tree = ttk.Treeview(targets_frame, 
                                       columns=('ID', 'Range', 'Velocity', 'Azimuth', 'Elevation', 'SNR'), 
                                       show='headings', height=20)
        self.targets_tree.heading('ID', text='Track ID')
        self.targets_tree.heading('Range', text='Range (m)')
        self.targets_tree.heading('Velocity', text='Velocity (m/s)')
        self.targets_tree.heading('Azimuth', text='Azimuth')
        self.targets_tree.heading('Elevation', text='Elevation')
        self.targets_tree.heading('SNR', text='SNR (dB)')
        
        self.targets_tree.column('ID', width=80)
        self.targets_tree.column('Range', width=100)
        self.targets_tree.column('Velocity', width=100)
        self.targets_tree.column('Azimuth', width=80)
        self.targets_tree.column('Elevation', width=80)
        self.targets_tree.column('SNR', width=80)
        
        self.targets_tree.pack(fill='both', expand=True, padx=5, pady=5)
    
    def setup_map_tab(self):
        """Setup the map display tab"""
        self.map_frame = ttk.Frame(self.tab_map)
        self.map_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Map placeholder
        self.map_label = ttk.Label(self.map_frame, text="Map will be displayed here after GPS data is received", 
                                 font=('Arial', 12))
        self.map_label.pack(expand=True)
    
    def setup_settings_tab(self):
        """Setup the settings tab"""
        settings_frame = ttk.Frame(self.tab_settings)
        settings_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        entries = [
            ('System Frequency (Hz):', 'system_frequency', 10e9),
            ('Chirp Duration (s):', 'chirp_duration', 30e-6),
            ('Chirps per Position:', 'chirps_per_position', 32),
            ('Frequency Min (Hz):', 'freq_min', 10e6),
            ('Frequency Max (Hz):', 'freq_max', 30e6),
            ('PRF1 (Hz):', 'prf1', 1000),
            ('PRF2 (Hz):', 'prf2', 2000),
            ('Max Distance (m):', 'max_distance', 50000)
        ]
        
        self.settings_vars = {}
        
        for i, (label, attr, default) in enumerate(entries):
            ttk.Label(settings_frame, text=label).grid(row=i, column=0, sticky='w', padx=5, pady=5)
            var = tk.StringVar(value=str(default))
            entry = ttk.Entry(settings_frame, textvariable=var, width=20)
            entry.grid(row=i, column=1, padx=5, pady=5)
            self.settings_vars[attr] = var
        
        ttk.Button(settings_frame, text="Apply Settings", 
                  command=self.apply_settings).grid(row=len(entries), column=0, columnspan=2, pady=10)
    
    def refresh_devices(self):
        """Refresh available USB devices"""
        # STM32 USB devices
        stm32_devices = self.stm32_usb_interface.list_devices()
        stm32_names = [dev['description'] for dev in stm32_devices]
        self.stm32_usb_combo['values'] = stm32_names
        
        # FTDI devices
        ftdi_devices = self.ftdi_interface.list_devices()
        ftdi_names = [dev['description'] for dev in ftdi_devices]
        self.ftdi_combo['values'] = ftdi_names
        
        if stm32_names:
            self.stm32_usb_combo.current(0)
        if ftdi_names:
            self.ftdi_combo.current(0)
    
    def start_radar(self):
        """Step 11: Start button pressed - Begin radar operation"""
        try:
            # Open STM32 USB device
            stm32_index = self.stm32_usb_combo.current()
            if stm32_index == -1:
                messagebox.showerror("Error", "Please select an STM32 USB device")
                return
                
            stm32_devices = self.stm32_usb_interface.list_devices()
            if stm32_index >= len(stm32_devices):
                messagebox.showerror("Error", "Invalid STM32 device selection")
                return
                
            if not self.stm32_usb_interface.open_device(stm32_devices[stm32_index]):
                messagebox.showerror("Error", "Failed to open STM32 USB device")
                return
            
            # Open FTDI device
            if FTDI_AVAILABLE:
                ftdi_index = self.ftdi_combo.current()
                if ftdi_index != -1:
                    ftdi_devices = self.ftdi_interface.list_devices()
                    if ftdi_index < len(ftdi_devices):
                        device_url = ftdi_devices[ftdi_index]['url']
                        if not self.ftdi_interface.open_device(device_url):
                            logging.warning("Failed to open FTDI device, continuing without radar data")
                else:
                    logging.warning("No FTDI device selected, continuing without radar data")
            else:
                logging.warning("FTDI not available, continuing without radar data")
            
            # Step 12: Send start flag to STM32 via USB
            if not self.stm32_usb_interface.send_start_flag():
                messagebox.showerror("Error", "Failed to send start flag to STM32")
                return
            
            # Step 13: Send settings to STM32 via USB
            self.apply_settings()
            
            # Start radar operation
            self.running = True
            self.start_button.config(state="disabled")
            self.stop_button.config(state="normal")
            self.status_label.config(text="Status: Radar running - Waiting for GPS data...")
            
            logging.info("Radar system started successfully via USB CDC")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start radar: {e}")
            logging.error(f"Start radar error: {e}")
    
    def stop_radar(self):
        """Stop radar operation"""
        self.running = False
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        self.status_label.config(text="Status: Radar stopped")
        
        self.stm32_usb_interface.close()
        self.ftdi_interface.close()
        
        logging.info("Radar system stopped")
    
    def apply_settings(self):
        """Step 13: Apply and send radar settings via USB"""
        try:
            self.settings.system_frequency = float(self.settings_vars['system_frequency'].get())
            self.settings.chirp_duration = float(self.settings_vars['chirp_duration'].get())
            self.settings.chirps_per_position = int(self.settings_vars['chirps_per_position'].get())
            self.settings.freq_min = float(self.settings_vars['freq_min'].get())
            self.settings.freq_max = float(self.settings_vars['freq_max'].get())
            self.settings.prf1 = float(self.settings_vars['prf1'].get())
            self.settings.prf2 = float(self.settings_vars['prf2'].get())
            self.settings.max_distance = float(self.settings_vars['max_distance'].get())
            
            if self.stm32_usb_interface.is_open:
                self.stm32_usb_interface.send_settings(self.settings)
            
            messagebox.showinfo("Success", "Settings applied and sent to STM32 via USB")
            logging.info("Radar settings applied via USB")
            
        except ValueError as e:
            messagebox.showerror("Error", f"Invalid setting value: {e}")
    
    def start_background_threads(self):
        """Start background data processing threads"""
        self.radar_thread = threading.Thread(target=self.process_radar_data, daemon=True)
        self.radar_thread.start()
        
        self.gps_thread = threading.Thread(target=self.process_gps_data, daemon=True)
        self.gps_thread.start()
        
        self.root.after(100, self.update_gui)
    
    def process_radar_data(self):
        """Step 39: Process incoming radar data from FTDI"""
        buffer = b''
        while True:
            if self.running and self.ftdi_interface.is_open:
                try:
                    data = self.ftdi_interface.read_data(4096)
                    if data:
                        buffer += data
                        
                        while len(buffer) >= 6:
                            packet = self.radar_packet_parser.parse_packet(buffer)
                            if packet:
                                self.process_radar_packet(packet)
                                packet_length = 4 + len(packet.get('payload', b'')) + 2
                                buffer = buffer[packet_length:]
                                self.received_packets += 1
                            else:
                                break
                                
                except Exception as e:
                    logging.error(f"Error processing radar data: {e}")
                    time.sleep(0.1)
            else:
                time.sleep(0.1)
    
    def process_gps_data(self):
        """Step 16/17: Process GPS data from STM32 via USB CDC"""
        while True:
            if self.running and self.stm32_usb_interface.is_open:
                try:
                    # Read data from STM32 USB
                    data = self.stm32_usb_interface.read_data(64, timeout=100)
                    if data:
                        gps_data = self.usb_packet_parser.parse_gps_data(data)
                        if gps_data:
                            self.gps_data_queue.put(gps_data)
                            logging.info(f"GPS Data received via USB: Lat {gps_data.latitude:.6f}, Lon {gps_data.longitude:.6f}, Alt {gps_data.altitude:.1f}m")
                except Exception as e:
                    logging.error(f"Error processing GPS data via USB: {e}")
            time.sleep(0.1)
    
    def process_radar_packet(self, packet):
        """Step 40: Process radar data and update displays"""
        try:
            if packet['type'] == 'range':
                range_meters = packet['range'] * 0.1
                
                target = RadarTarget(
                    id=packet['chirp'],
                    range=range_meters,
                    velocity=0,
                    azimuth=packet['azimuth'],
                    elevation=packet['elevation'],
                    snr=20.0,
                    timestamp=packet['timestamp']
                )
                
                self.update_range_doppler_map(target)
                
            elif packet['type'] == 'doppler':
                lambda_wavelength = 3e8 / self.settings.system_frequency
                velocity = (packet['doppler_real'] / 32767.0) * (self.settings.prf1 * lambda_wavelength / 2)
                self.update_target_velocity(packet, velocity)
                
            elif packet['type'] == 'detection':
                if packet['detected']:
                    logging.info(f"CFAR Detection: Elevation {packet['elevation']}, Azimuth {packet['azimuth']}")
                    
        except Exception as e:
            logging.error(f"Error processing radar packet: {e}")
    
    def update_range_doppler_map(self, target):
        """Update range-Doppler map with new target"""
        range_bin = min(int(target.range / 50), 1023)
        doppler_bin = min(abs(int(target.velocity)), 31)
        
        self.radar_processor.range_doppler_map[range_bin, doppler_bin] += 1
        
        self.radar_processor.detected_targets.append(target)
        
        if len(self.radar_processor.detected_targets) > 100:
            self.radar_processor.detected_targets = self.radar_processor.detected_targets[-100:]
    
    def update_target_velocity(self, packet, velocity):
        """Update target velocity information"""
        for target in self.radar_processor.detected_targets:
            if (target.azimuth == packet['azimuth'] and 
                target.elevation == packet['elevation'] and
                target.id == packet['chirp']):
                target.velocity = velocity
                break
    
    def update_gui(self):
        """Step 40: Update all GUI displays"""
        try:
            # Update status
            if self.running:
                self.status_label.config(
                    text=f"Status: Running - Packets: {self.received_packets} - GPS: {self.current_gps.latitude:.4f}, {self.current_gps.longitude:.4f}")
            
            # Update range-Doppler map
            if hasattr(self, 'range_doppler_plot'):
                display_data = np.log10(self.radar_processor.range_doppler_map + 1)
                self.range_doppler_plot.set_array(display_data)
                self.canvas.draw_idle()
            
            # Update targets list
            self.update_targets_list()
            
            # Update GPS display
            self.update_gps_display()
            
        except Exception as e:
            logging.error(f"Error updating GUI: {e}")
        
        self.root.after(100, self.update_gui)
    
    def update_targets_list(self):
        """Update the targets list display"""
        for item in self.targets_tree.get_children():
            self.targets_tree.delete(item)
        
        for target in self.radar_processor.detected_targets[-20:]:
            self.targets_tree.insert('', 'end', values=(
                target.track_id, 
                f"{target.range:.1f}", 
                f"{target.velocity:.1f}",
                target.azimuth,
                target.elevation,
                f"{target.snr:.1f}"
            ))
    
    def update_gps_display(self):
        """Step 18: Update GPS display and center map"""
        try:
            while not self.gps_data_queue.empty():
                gps_data = self.gps_data_queue.get_nowait()
                self.current_gps = gps_data
                
                # Update GPS label
                self.gps_label.config(
                    text=f"GPS: Lat {gps_data.latitude:.6f}, Lon {gps_data.longitude:.6f}, Alt {gps_data.altitude:.1f}m")
                
                # Update map
                self.update_map_display(gps_data)
                
        except queue.Empty:
            pass
    
    def update_map_display(self, gps_data):
        """Step 18: Update map display with current GPS position"""
        try:
            self.map_label.config(text=f"Radar Position: {gps_data.latitude:.6f}, {gps_data.longitude:.6f}\n"
                                     f"Altitude: {gps_data.altitude:.1f}m\n"
                                     f"Coverage: 50km radius\n"
                                     f"Map centered on GPS coordinates")
            
        except Exception as e:
            logging.error(f"Error updating map display: {e}")

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
