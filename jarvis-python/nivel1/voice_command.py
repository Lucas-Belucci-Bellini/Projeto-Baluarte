"""
Jarvis - Nível 1: Comando por Voz
Ouve comandos e executa ações.
"""

import speech_recognition as sr
import pyttsx3
import threading


class VoiceCommand:
    def __init__(self, wake_word="jarvis", language="pt-BR"):
        self.wake_word = wake_word.lower()
        self.language = language
        self.recognizer = sr.Recognizer()
        self.commands = {}
        self.running = False

        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 175)
        voices = self.engine.getProperty("voices")
        # tenta usar voz em português se disponível
        for voice in voices:
            if "brazil" in voice.name.lower() or "portuguese" in voice.name.lower():
                self.engine.setProperty("voice", voice.id)
                break

    def speak(self, text: str):
        print(f"[JARVIS] {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def register_command(self, keyword: str, callback, description: str = ""):
        """Registra um comando de voz."""
        self.commands[keyword.lower()] = {"fn": callback, "desc": description}
        print(f"[JARVIS] Comando registrado: '{keyword}' — {description}")

    def _listen(self) -> str | None:
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            try:
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=8)
                text = self.recognizer.recognize_google(audio, language=self.language)
                return text.lower()
            except sr.WaitTimeoutError:
                return None
            except sr.UnknownValueError:
                return None
            except sr.RequestError as e:
                print(f"[JARVIS] Erro no serviço de voz: {e}")
                return None

    def _process(self, text: str):
        print(f"[JARVIS] Ouvi: '{text}'")
        for keyword, cmd in self.commands.items():
            if keyword in text:
                cmd["fn"](text)
                return
        self.speak("Não entendi o comando. Pode repetir?")

    def start(self):
        self.running = True
        print(f"[JARVIS] Aguardando palavra-chave: '{self.wake_word}'...")
        self.speak("Jarvis online. Aguardando seus comandos.")

        while self.running:
            text = self._listen()
            if text and self.wake_word in text:
                self.speak("Sim?")
                command = self._listen()
                if command:
                    self._process(command)

    def start_background(self):
        thread = threading.Thread(target=self.start, daemon=True)
        thread.start()
        return thread

    def stop(self):
        self.running = False


if __name__ == "__main__":
    jarvis = VoiceCommand(wake_word="jarvis")

    jarvis.register_command("horas", lambda t: jarvis.speak(
        __import__("datetime").datetime.now().strftime("São %H horas e %M minutos.")
    ), "diz as horas atuais")

    jarvis.register_command("câmera", lambda t: jarvis.speak(
        "Iniciando reconhecimento de câmera."
    ), "ativa a câmera")

    jarvis.register_command("desligar", lambda t: (
        jarvis.speak("Até logo."), jarvis.stop()
    ), "desliga o Jarvis")

    jarvis.start()
