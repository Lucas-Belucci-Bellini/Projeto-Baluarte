"""
Jarvis - Nível 1: Sistema Integrado
Movimento → Reconhecimento Facial → Comando por Voz
"""

import threading
import time
from camera_motion import MotionDetector
from face_recognition_module import FaceRecognizer
from voice_command import VoiceCommand


class Jarvis:
    def __init__(self):
        self.motion = MotionDetector(sensitivity=500)
        self.face = FaceRecognizer()
        self.voice = VoiceCommand(wake_word="jarvis")
        self.current_user = None
        self.active = False
        self._setup()

    def _setup(self):
        # movimento acorda o Jarvis
        self.motion.on_motion(self._on_motion_detected)

        # rosto identificado
        self.face.on_recognition(self._on_face_recognized)

        # comandos de voz
        self.voice.register_command("horas", self._cmd_horas, "diz as horas")
        self.voice.register_command("câmera", self._cmd_camera, "mostra câmera")
        self.voice.register_command("quem sou", self._cmd_quem_sou, "diz o usuário atual")
        self.voice.register_command("desligar", self._cmd_desligar, "desliga o Jarvis")

    def _on_motion_detected(self):
        if not self.active:
            self.active = True
            print("[JARVIS] Movimento detectado — sistema ativado.")
            self.voice.speak("Detecção de presença. Identificando...")

    def _on_face_recognized(self, name: str):
        if name != "Desconhecido" and name != self.current_user:
            self.current_user = name
            self.voice.speak(f"Bem-vindo, {name}. Como posso ajudar?")
        elif name == "Desconhecido":
            self.voice.speak("Pessoa não reconhecida detectada.")

    def _cmd_horas(self, _):
        from datetime import datetime
        hora = datetime.now().strftime("%H horas e %M minutos")
        self.voice.speak(f"São {hora}.")

    def _cmd_camera(self, _):
        self.voice.speak("Iniciando câmera.")
        threading.Thread(target=self.face.start, daemon=True).start()

    def _cmd_quem_sou(self, _):
        if self.current_user:
            self.voice.speak(f"Você é {self.current_user}.")
        else:
            self.voice.speak("Ainda não identifiquei você.")

    def _cmd_desligar(self, _):
        self.voice.speak("Desligando. Até logo.")
        self.voice.stop()

    def start(self):
        print("=" * 50)
        print("  JARVIS - Nível 1 - Iniciando...")
        print("=" * 50)

        if not self.face.known_names:
            print("[JARVIS] Nenhum rosto registrado.")
            nome = input("Seu nome para registro: ")
            self.face.register_face(nome)

        # câmera + reconhecimento em thread separada
        threading.Thread(target=self.face.start, daemon=True).start()

        # voz em thread separada
        self.voice.start_background()

        # detecção de movimento na thread principal
        self.motion.start()


if __name__ == "__main__":
    jarvis = Jarvis()
    jarvis.start()
