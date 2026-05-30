"""
Jarvis - Nível 1: Reconhecimento Facial
Identifica quem está na frente da câmera.
"""

import cv2
import face_recognition
import numpy as np
import os
import pickle
from pathlib import Path


FACES_DIR = Path(__file__).parent / "faces"
ENCODINGS_FILE = Path(__file__).parent / "face_encodings.pkl"


class FaceRecognizer:
    def __init__(self, camera_index=0, tolerance=0.5):
        self.camera_index = camera_index
        self.tolerance = tolerance
        self.known_encodings = []
        self.known_names = []
        self.recognition_callback = None
        FACES_DIR.mkdir(exist_ok=True)
        self._load_encodings()

    def on_recognition(self, callback):
        """Callback chamado com o nome da pessoa reconhecida."""
        self.recognition_callback = callback

    def register_face(self, name: str, image_path: str = None):
        """
        Registra um rosto. Se image_path for None, captura pela câmera.
        """
        if image_path:
            image = face_recognition.load_image_file(image_path)
        else:
            image = self._capture_face(name)
            if image is None:
                return False

        encodings = face_recognition.face_encodings(image)
        if not encodings:
            print(f"[JARVIS] Nenhum rosto encontrado na imagem de {name}.")
            return False

        self.known_encodings.append(encodings[0])
        self.known_names.append(name)
        self._save_encodings()
        print(f"[JARVIS] Rosto de '{name}' registrado com sucesso!")
        return True

    def _capture_face(self, name: str):
        cap = cv2.VideoCapture(self.camera_index)
        print(f"[JARVIS] Olhe para a câmera. Pressione ESPAÇO para capturar o rosto de '{name}'.")
        captured = None

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            cv2.putText(frame, f"Registrando: {name} | ESPACO para capturar",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.imshow("JARVIS - Registrar Rosto", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord(' '):
                captured = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                save_path = FACES_DIR / f"{name}.jpg"
                cv2.imwrite(str(save_path), frame)
                print(f"[JARVIS] Imagem salva em {save_path}")
                break
            elif key == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        return captured

    def _save_encodings(self):
        with open(ENCODINGS_FILE, "wb") as f:
            pickle.dump({"encodings": self.known_encodings, "names": self.known_names}, f)

    def _load_encodings(self):
        if ENCODINGS_FILE.exists():
            with open(ENCODINGS_FILE, "rb") as f:
                data = pickle.load(f)
                self.known_encodings = data["encodings"]
                self.known_names = data["names"]
            print(f"[JARVIS] {len(self.known_names)} rosto(s) carregado(s): {self.known_names}")

    def start(self):
        cap = cv2.VideoCapture(self.camera_index)
        print("[JARVIS] Reconhecimento facial ativo... (pressione Q para sair)")
        last_recognized = None

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            locations = face_recognition.face_locations(rgb)
            encodings = face_recognition.face_encodings(rgb, locations)

            for encoding, location in zip(encodings, locations):
                matches = face_recognition.compare_faces(
                    self.known_encodings, encoding, tolerance=self.tolerance
                )
                name = "Desconhecido"

                if True in matches:
                    distances = face_recognition.face_distance(self.known_encodings, encoding)
                    best = np.argmin(distances)
                    if matches[best]:
                        name = self.known_names[best]

                top, right, bottom, left = [v * 4 for v in location]
                color = (0, 255, 0) if name != "Desconhecido" else (0, 0, 255)
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                cv2.putText(frame, name, (left, top - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

                if name != last_recognized:
                    last_recognized = name
                    print(f"[JARVIS] Reconhecido: {name}")
                    if self.recognition_callback:
                        self.recognition_callback(name)

            cv2.putText(frame, "JARVIS | Reconhecimento Facial", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            cv2.imshow("JARVIS - Reconhecimento Facial", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    recognizer = FaceRecognizer()

    if not recognizer.known_names:
        print("[JARVIS] Nenhum rosto registrado. Vamos registrar o seu.")
        nome = input("Seu nome: ")
        recognizer.register_face(nome)

    def saudacao(nome):
        if nome != "Desconhecido":
            print(f"[JARVIS] Bem-vindo, {nome}!")
        else:
            print("[JARVIS] Pessoa não reconhecida detectada.")

    recognizer.on_recognition(saudacao)
    recognizer.start()
