from pathlib import Path
from unittest import TestCase

import numpy as np

from llm.loader import load_data

DIR = Path(__file__).parent


class TestLoader(TestCase):

    def test_loader(self):
        train_ids, eval_ids = load_data(
            train_ratio=0.8,
            data_path=DIR / 'training_data.txt',
            return_values=True,
            name='test_loader_data'
        )
        np.testing.assert_array_equal(
            train_ids,
            np.array([20682, 73, 454, 11, 2912, 28654, 89, 12, 31222, 5633, 3852, 285, 6, 1324, 13485, 317])
        )
        np.testing.assert_array_equal(
            eval_ids,
            np.array([75, 4835, 7298, 385, 13])
        )
