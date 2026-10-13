import os
import shutil
from functools import lru_cache

import diskcache as dc

from llm.utils import is_windows_os


class DiskCache:

    def __init__(self, default_ttl_sec=None):
        self._default_ttl_sec = default_ttl_sec
        size_limit = os.environ.get('LLM_DISK_MAX_SIZE')
        if size_limit:
            size_limit = float(size_limit) * 1024 ** 3
        else:
            size_limit = shutil.disk_usage("/")[0] * 0.75
        self._client = dc.Cache(
            directory=os.environ.get('LLM_DISK_PATH') or self.get_default_directory(),
            size_limit=size_limit,
        )

    @staticmethod
    def get_default_directory():
        return os.path.join(os.getenv('LOCALAPPDATA') if is_windows_os() else '~/.cache', 'diskcache_llm')

    def get(self, key, default=None):
        result = self._client.get(key)
        return result if result is not None else default

    def mget(self, keys, copy=None):
        return {k: self.get(key=k) for k in list(keys) if k in self}

    def _get_ttl(self, ttl: int = None):
        return self._default_ttl_sec if ttl is None else ttl

    def set(self, key, value, ttl=None, copy=None):
        stored = self._client.set(key, value, expire=self._get_ttl(ttl))
        return stored

    def mset(self, items, ttl=None, copy=None):
        stored = all(self.set(key=k, value=v, ttl=ttl) for k, v in items.items())
        return stored

    def keys(self, **kwargs):
        return list(self._client)

    def delete(self, key):
        if key in self._client:
            del self._client[key]
            return True
        else:
            return False

    def clear(self):
        self._client.clear()

    def contains(self, items):
        return all(k in self._client for k in items)

    def __len__(self):
        return len(self._client)

    def __contains__(self, item):
        return self.contains([item]) > 0

    def __getitem__(self, item):
        return self.get(key=item)

    def __setitem__(self, key, value):
        return self.set(key=key, value=value)

    def __repr__(self):
        return f'DiskCache: {self.__len__()} keys, {self._client.directory}'


@lru_cache
def get_disk(default_ttl_sec=None) -> DiskCache:
    return DiskCache(default_ttl_sec)
