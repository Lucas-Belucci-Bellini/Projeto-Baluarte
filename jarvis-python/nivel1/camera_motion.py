"""
Jarvis - Nível 1: Detecção de Movimento
Detecta movimento pela câmera e acorda o Jarvis.
"""

import cv2
import numpy as np
from datetime import datetime


class MotionDetector:
    def __init__(self, sensitivity=500, camera_index=0):
        self.sensitivity = sensitivity  # área mínima para contar como movimento
        self.camera_index = camera_index
        self.motion_callback = None

    def on_motion(self, callback):
        """Registra função a ser chamada quando detectar movimento."""
        self.motion_callback = callback

    def start(self):
        cap = cv2.VideoCapture(self.camera_index)
        if not cap.isOpened():
            print("[JARVIS] Câmera não encontrada.")
            return

        print("[JARVIS] Monitorando movimento... (pressione Q para sair)")
        ret, frame1 = cap.read()
        ret, frame2 = cap.read()

        motion_active = False

        while cap.isOpened():
            diff = cv2.absdiff(frame1, frame2)
            gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blur, 20, 255, cv2.THRESH_BINARY)
            dilated = cv2.dilate(thresh, None, iterations=3)
            contours, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

            motion_detected = False
            for contour in contours:
                if cv2.contourArea(contour) > self.sensitivity:
                    motion_detected = True
                    x, y, w, h = cv2.boundingRect(contour)
                    cv2.rectangle(frame1, (x, y), (x + w, y + h), (0, 255, 0), 2)

            status = "MOVIMENTO" if motion_detected else "aguardando"
            color = (0, 0, 255) if motion_detected else (0, 255, 0)
            cv2.putText(frame1, f"JARVIS | {status}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            cv2.putText(frame1, datetime.now().strftime("%H:%M:%S"), (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            cv2.imshow("JARVIS - Detecção de Movimento", frame1)

            if motion_detected and not motion_active:
                motion_active = True
                print(f"[JARVIS] Movimento detectado às {datetime.now().strftime('%H:%M:%S')}")
                if self.motion_callback:
                    self.motion_callback()
            elif not motion_detected:
                motion_active = False

            frame1 = frame2
            ret, frame2 = cap.read()

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    detector = MotionDetector(sensitivity=500)

    def alerta():
        print("[JARVIS] Presença detectada! Iniciando reconhecimento...")

    detector.on_motion(alerta)
    detector.start()
