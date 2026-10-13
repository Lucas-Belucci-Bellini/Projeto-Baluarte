from pathlib import Path
from unittest import TestCase

from llm.configurator import load_config_file

DIR = Path(__file__).parent


class TestConfigurator(TestCase):

    def test_configurator(self):
        config = load_config_file('train_test.json')
        self.assertIsInstance(config, dict)
        self.assertGreater(len(config), 0)

        with self.assertRaises(ValueError):
            load_config_file('does_not_exist.json')
