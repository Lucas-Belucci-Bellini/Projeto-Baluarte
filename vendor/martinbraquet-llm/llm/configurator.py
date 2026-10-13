import json
import os
from ast import literal_eval
from dataclasses import dataclass
from pathlib import Path

from llm import BASE_DIR


# @dataclass
# class FileConfig(DataclassUtils):
#     config_file: str | Path = None
#
#     def __post_init__(self):
#         if self.config_file is not None:
#             config = load_config_file(self.config_file)
#             for k, v in config.items():
#                 if not hasattr(self, k):
#                     raise ValueError(f"Unknown config key: {k}")
#                 try:
#                     v = literal_eval(v)
#                 except (SyntaxError, ValueError):
#                     pass
#                 prev_v = getattr(self, k)
#                 if type(v) != type(prev_v) and prev_v is not None:
#                     print(f"WARNING: Key {k} has type {type(v)} but expected {type(prev_v)}")
#                 print(f"Overriding: {k} = {v}")
#                 setattr(self, k, v)
#
#     @classmethod
#     def from_config(cls, config):
#         relevant_config = get_relevant_config(cls, config)
#         return cls(**relevant_config)
#
#
# def get_relevant_config(subclass, config):
#     relevant_keys = subclass.keys()
#     all_keys = config.keys()
#     keys = set(relevant_keys) & set(all_keys)
#     relevant_config = {k: getattr(config, k) for k in keys}
#     return relevant_config


def load_config_file(config_file) -> dict:
    if not isinstance(config_file, Path):
        config_file = Path(config_file)
    paths = []
    if not os.path.exists(config_file):
        paths.append(str(config_file))
        config_file = BASE_DIR / 'config' / config_file
    if not os.path.exists(config_file):
        paths.append(str(config_file))
        raise ValueError(
            f"Config file does not exist in any of {', '.join(paths)}. "
            f"If you gave a relative path, make sure it is relative to the directory where this script is run."
        )
    with open(config_file) as f:
        config = json.load(f)
    return config
