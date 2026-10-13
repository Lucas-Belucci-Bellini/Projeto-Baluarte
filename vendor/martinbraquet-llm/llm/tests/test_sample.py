from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

import numpy as np
import torch

from llm.sample import Sampler

DIR = Path(__file__).parent
model_path = DIR / 'results' / 'test1'


def patch_multinomial_sampling(probs, num_samples):
    """
    Seeded torch.multinomial is platform-dependent, so we can't use it for reproducibility in unit testing
    Using np.random.multinomial allows for reproducibility. But since is less efficient (need to share memory between
    CPU and GPU), we stick to torch.multinomial in production.
    """
    probs = probs[0].cpu().numpy().astype(np.float64)
    probs /= probs.sum()
    idx_next = torch.asarray([[np.argmax(np.random.multinomial(num_samples, probs, size=1)[0])]])
    return idx_next


@patch('torch.multinomial', patch_multinomial_sampling)
class TestSample(TestCase):
    def setUp(self):
        torch.manual_seed(0)

    def test_sample(self):
        sampler = Sampler(model_path=model_path, torch_compile=True)
        text = sampler.generate_text(prompt='Love is the answer to', max_tokens=20)
        self.assertEqual('Love is the answer toN4fpPLbNK\\9A3Necys\n"', text)

    def test_config_file(self):
        config_file = DIR / 'config.json'
        text = Sampler(config_file=config_file, model_path=model_path).generate_text(max_tokens=20)
        self.assertEqual('\nN4fpPLbNK\\9A3Necys\n"', text)

    def test_sample_from_online(self):
        sampler = Sampler(init_from='online', model_path='gpt2')
        text = sampler.generate_text(prompt='The sun', max_tokens=10)
        self.assertEqual('The sun has been shining for weeks, but it has set', text)

    def test_file_prompt(self):
        sampler = Sampler(model_path=model_path)
        text = sampler.generate_text(prompt='FILE:prompt.txt', max_tokens=10)
        self.assertEqual(23, len(text))
