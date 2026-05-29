import tkinter
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

from llm.interface import UserInterface
from llm.sample import Sampler

DIR = Path(__file__).parent


class TestInterface(TestCase):

    @patch.object(Sampler, 'generate_text', return_value="Hello! How can I help you today?")
    def test_interface(self, sampler_mock):
        ui = UserInterface(model_path=DIR / 'results' / 'test1')
        ui.user_entry.insert(0, "hello")
        ui.handle_send()
        self.assertEqual(ui.user_entry.get(), "")
        ui.chat_window.config(state=tkinter.NORMAL)
        chat_content = ui.chat_window.get("1.0", tkinter.END)
        self.assertIn("You: hello", chat_content)
        self.assertIn("Bot: Hello! How can I help you today?", chat_content)

        ui.user_entry.insert(0, "")
        ui.handle_send()
