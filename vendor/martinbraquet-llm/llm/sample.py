import os
import pickle
from functools import partial

import tiktoken
import torch

from llm.model import GPT
from llm.utils import unbox, to_path
from llm.loader import ModelLoader
from llm.ml import ML

DEFAULT_PROMPT = "\n"


class Sampler(ML):
    def __init__(
        self,
        checkpoint_name: str = 'last',
        init_from: str = 'resume',
        **kwargs
    ):
        """
        :param checkpoint_name: name of the checkpoint to load, ignored if init_from is not 'resume'
        :param init_from: either 'resume' (from a local model_path) or 'online' (from HuggingFace hub)
        """
        super().__init__(**kwargs)
        self.checkpoint_name = checkpoint_name
        self.init_from = init_from

        self.manual_seed()

        checkpoint = None
        if self.init_from == 'resume':
            # init from a model saved in a specific directory
            model_loader = ModelLoader(
                model_path=self.model_path,
                device=self.device,
                checkpoint_name=self.checkpoint_name,
            )
            self.model = model_loader.load()
            checkpoint = model_loader.checkpoint
        elif self.init_from == 'online':
            # init from a given GPT-2 model
            assert str(self.model_path).startswith('gpt2'), 'model_path must start with gpt2'
            self.model = GPT.from_pretrained(str(self.model_path), dict(dropout=0.0))
        else:
            raise ValueError(f"Unknown init_from {self.init_from}, must be 'resume' or 'online'")

        self.model.eval()
        self.model.to(self.device)
        self.compile_model()

        self._setup_encoding(ckpt_config=checkpoint.get('config') if checkpoint else None)

    def _setup_encoding(self, ckpt_config):
        encoding = None
        if self.init_from == 'resume' and ckpt_config is not None:
            encoding = ckpt_config.get('encoding')
            meta_dir = to_path(ckpt_config.get('data_dir'))
            # if isinstance(meta_dir, Path) and not meta_dir.is_absolute():
            #     meta_dir = BASE_DIR / 'results' / meta_dir
            if meta_dir and os.path.exists(meta_path := meta_dir / 'meta.pkl'):
                with open(meta_path, 'rb') as f:
                    meta = pickle.load(f)
                stoi, itos = meta.get('stoi'), meta.get('itos')
                if stoi is not None or itos is not None:
                    print(f"Loading encoding from {meta_path}...")
                    print(f"stoi: {stoi}")
                    print(f"itos: {itos}")
                    self.encode = lambda s: [stoi[c] for c in s]
                    self.decode = lambda l: ''.join([itos[i] for i in l])
                    return

        if encoding in (None, 'gpt2'):
            if encoding is None:
                print("No meta.pkl found, assuming GPT-2 encodings")
            enc = tiktoken.get_encoding("gpt2")
            self.encode = partial(enc.encode, allowed_special={"<|endoftext|>"})
            self.decode = enc.decode
            return

        raise ValueError(f"Unknown encoding {encoding}")

    def generate_text(
        self,
        prompt: str = DEFAULT_PROMPT,
        num_samples: int = 1,
        max_tokens: int = 100,
        temperature: float = 1.0,
        top_k: int = 200,
    ):
        """
        :param prompt: prompt to start generation.
          Can be "<|endoftext|>" or etc. Can also specify a file, use as: "FILE:prompt.txt"
        :param num_samples: number of samples to draw
        :param max_tokens: number of tokens generated in each sample
        :param temperature: 1.0 = no change, < 1.0 = less random, > 1.0 = more random, in predictions
        :param top_k: retain only the top_k most likely tokens, clamp others to have 0 probability
        """
        if prompt.startswith('FILE:'):
            with open(prompt[5:], 'r', encoding='utf-8') as f:
                prompt = f.read()

        start_ids = self.encode(prompt)
        x = (torch.tensor(start_ids, dtype=torch.long, device=self.device)[None, ...])

        result = []
        with torch.no_grad(), self.ctx:
            for k in range(num_samples):
                y = self.model.generate(
                    idx=x,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_k=top_k
                )
                result.append(self.decode(y[0].tolist()))

        return unbox(result)
