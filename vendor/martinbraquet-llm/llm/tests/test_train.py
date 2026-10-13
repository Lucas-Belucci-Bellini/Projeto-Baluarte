import shutil
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

from llm.train import Trainer

DIR = Path(__file__).parent


class FakeWandb:
    @classmethod
    def init(cls, *args, **kwargs):
        pass

    @classmethod
    def log(cls, *args, **kwargs):
        pass


BASE_CONFIG = dict(
    log_interval=9,
    eval_interval=2,
    eval_iters=2,
    batch_size=1,
    block_size=4,
    n_layer=2,
    n_head=2,
    n_embd=4,
    dropout=0.2,
    learning_rate=10e-3,
    lr_decay_iters=20,
    min_lr=5e-3,
    beta2=0.99,
    patience=2
)


class TestTrain(TestCase):
    @classmethod
    def setUpClass(cls):
        shutil.rmtree(DIR / 'data', ignore_errors=True)

    def test_train(self):
        config = dict(
            init_from="scratch",
            model_path=DIR / 'results' / ".out_test_train",
            training_data_path="prince",
            torch_compile=False,
            **BASE_CONFIG,
        )
        trainer = Trainer(**config)
        trainer.run()

        self.assertFalse(trainer.resume())

    def test_train_resume(self):
        results_dir = DIR / 'results'
        shutil.copytree(
            results_dir / 'test1',
            results_dir / '.test_train_resume',
            dirs_exist_ok=True,
        )
        trainer = Trainer(
            init_from="resume",
            model_path=results_dir / ".test_train_resume",
            training_data_path="prince",
            max_iters=30,
        )
        trainer.run()

    @patch('wandb.init', new=FakeWandb.init)
    @patch('wandb.log', new=FakeWandb.log)
    def test_train_wandb(self):
        trainer = Trainer(
            init_from="scratch",
            model_path=DIR / 'results' / ".train_wandb",
            training_data_path="prince",
            max_iters=20,
            **BASE_CONFIG,
            wandb_log=True,
        )
        trainer.run()

    def test_train_profile(self):
        trainer = Trainer(
            init_from="scratch",
            model_path=DIR / 'results' / ".test_train_profile",
            training_data_path="prince",
            max_iters=1,
            **BASE_CONFIG,
            profile=True,
        )
        trainer.run()

    def test_train_finetune(self):
        trainer = Trainer(
            init_from="gpt2",
            model_path=DIR / 'results' / ".gpt2",
            training_data_path="prince",
            max_iters=2,
            block_size=8,
        )
        trainer.load_model()
        model = trainer.model
        size = model.get_num_params()
        self.assertEqual(123653376, size)

    def test_vocab_size(self):
        trainer = Trainer(
            init_from="scratch",
            model_path=DIR / 'results' / ".test_vocab_size",
            training_data_path="prince",
            encoding='char',
            max_iters=2,
            **BASE_CONFIG,
        )
        trainer.run()

