from contextlib import nullcontext
from pathlib import Path

import numpy as np
import torch

from llm.configurator import load_config_file
from llm.utils import MISSING, get_default_device, parse_model_path

_DEFAULT_CONFIG = dict(
    device=None,
    _seed=1337,
    torch_compile=False,
    dtype=None,
    model_path='out',
    config_file=None,
)


class ML:
    def __init__(
        self,
        device: str = MISSING,
        seed: int = MISSING,
        torch_compile: bool = MISSING,
        dtype: str = MISSING,
        model_path: Path | str = MISSING,
        config_file: str = MISSING,
        **kwargs
    ):
        """
        :param device: 'cpu', 'cuda', 'cuda:0', 'cuda:1' etc., or try 'mps' on macbooks
        :param seed: random seed. set it to any integer to remove randomness (i.e., always produce the same output for
            the same input)
        :param torch_compile: use PyTorch 2.0 to compile the model to be faster
        :param dtype: 'float32', 'bfloat16', or 'float16', the latter will auto implement a GradScaler
        :param model_path: directory to load the model
        :param config_file: config file to load
        """
        self.__dict__.update(_DEFAULT_CONFIG)
        self._process_config_file(config_file)

        if device is not MISSING:
            self.device = device
        elif self.device is None:
            self.device = get_default_device()
        print(f'Using device {self.device}')

        if seed is not MISSING:
            self._seed = seed

        if torch_compile is not MISSING:
            self.torch_compile = torch_compile

        if model_path is not MISSING:
            self.model_path = model_path
        self.model_path = parse_model_path(self.model_path)

        self.model = None

        if dtype is not MISSING:
            self.dtype = dtype
        elif self.dtype is None:
            # 'float32', 'bfloat16', or 'float16', the latter will auto implement a GradScaler
            self.dtype = 'bfloat16' if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else 'float16'

        torch.backends.cuda.matmul.allow_tf32 = True  # allow tf32 on matmul
        torch.backends.cudnn.allow_tf32 = True  # allow tf32 on cudnn
        self.ctx = nullcontext()
        if self.is_cuda:
            # note: float16 data type will automatically use a GradScaler
            pt_dtype = {'float32': torch.float32, 'bfloat16': torch.bfloat16, 'float16': torch.float16}[self.dtype]
            self.ctx = torch.amp.autocast(device_type='cuda', dtype=pt_dtype)

    @property
    def model_name(self):
        return Path(self.model_path).stem

    @property
    def is_cuda(self):
        return self.device.startswith('cuda')

    @property
    def device_type(self):
        return 'cuda' if self.is_cuda else 'cpu'

    @property
    def seed(self):
        return self._seed

    def manual_seed(self):
        if self.seed is not None:
            np.random.seed(self.seed)
            torch.manual_seed(self.seed)
            torch.cuda.manual_seed(self.seed)

    def compile_model(self):
        if self.torch_compile:
            print("compiling the model...")
            self.model = torch.compile(self.model)  # requires PyTorch 2.0

    def get_config(self):
        """
        Return a dict of the attributes of this class
        """
        skip_attrs = ('model', 'ctx')
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_') and k not in skip_attrs}

    def _process_config_file(self, config_file):
        if config_file is not MISSING:
            config = load_config_file(config_file)
            for k in config.keys():
                if k.startswith('_'):
                    raise ValueError(f"Key {k} cannot start with '_'")
            self.__dict__.update(config)
