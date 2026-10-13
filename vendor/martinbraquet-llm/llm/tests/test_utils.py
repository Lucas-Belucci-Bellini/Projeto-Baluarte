from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase

from llm.utils import get_last_checkpoint, box, to_path, unbox

DIR = Path(__file__).parent


class TestUtils(TestCase):

    def test_last_checkpoint(self):
        with TemporaryDirectory() as tmpdir:
            with self.assertRaises(ValueError) as e:
                get_last_checkpoint(tmpdir)
            self.assertEqual(f'no checkpoints found in {tmpdir}', str(e.exception))

            Path(tmpdir, 'ckpt_init.pt').touch()
            Path(tmpdir, 'ckpt_0002.pt').touch()
            self.assertEqual('ckpt_0002.pt', get_last_checkpoint(tmpdir))

    def test_path(self):
        self.assertEqual(Path('a'), to_path('a'))
        self.assertEqual(Path('a'), to_path(Path('a')))
