    
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
