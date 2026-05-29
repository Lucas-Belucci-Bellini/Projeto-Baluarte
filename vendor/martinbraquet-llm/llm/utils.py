import hashlib
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import torch

DIR = Path(__file__).parent


def get_last_checkpoint(model_path):
    """
    Init from the last checkpoint in the model_path
    """
    ckpt_list = [f for f in os.listdir(model_path) if 'ckpt' in f]
    if not ckpt_list:
        raise ValueError(f'no checkpoints found in {model_path}')
    if 'ckpt.pt' in ckpt_list:
        return 'ckpt.pt'
    ckpt_list = sorted(ckpt_list)
    checkpoint_name = ckpt_list[-1]
    if checkpoint_name == 'ckpt_init.pt' and len(ckpt_list) > 1:
        checkpoint_name = ckpt_list[-2]
    return checkpoint_name


def parse_model_path(model_path):
    if not isinstance(model_path, Path):
        model_path = Path(model_path)
    # if not model_path.is_absolute():
    #     model_path = DIR / 'results' / model_path
    return model_path


def unbox(e: Any):
    """
    Returns the only element of e if it has only one element, otherwise returns e

    >>> unbox('ab')
    'ab'
    >>> unbox(1)
    1
    >>> unbox([1])
    1
    >>> unbox([1, 2, 3])
    [1, 2, 3]
    >>> unbox({'a': 1})
    1
    >>> unbox({'a': 1, 'b': 2})
    {'a': 1, 'b': 2}
    """
    if isinstance(e, str):
        return e
    default = e
    if isinstance(e, dict):
        e = e.values()
    return next(iter(e)) if hasattr(e, '__len__') and len(e) == 1 else default


def box(e):
    """
    Box a single element into a list

    >>> box(1)
    [1]
    >>> box([1])
    [1]
    """
    if isinstance(e, (list, tuple, set)):
        return e
    return [e]


# @dataclass
# class DataclassUtils:
#
#     @classmethod
#     def keys(cls):
#         return list(cls.__dataclass_fields__)
#
#     def dict(self):
#         return {k: getattr(self, k) for k in self.keys()}


@lru_cache
def get_default_device():
    # examples: 'cpu', 'cuda', 'cuda:0', 'cuda:1' etc., or try 'mps' on macbooks
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    return device


def str_to_hash(s):
    return hashlib.sha256(s.encode()).hexdigest()


def list_to_hash(items):
    return str_to_hash('::'.join(items))


def to_path(s):
    if isinstance(s, str):
        return Path(s)
    return s


def make_dir(name):
    os.makedirs(name, exist_ok=True)


class Missing:
    def __repr__(self):
        return 'MISSING'


MISSING = Missing()


def is_windows_os() -> bool:
    return os.name == 'nt'
