import os
from unittest import TestCase

from llm.cache.disk import get_disk


class TestDiskcache(TestCase):

    def test_diskcache(self):
        current_path = os.environ.get('LLM_DISK_PATH')
        try:
            os.environ['LLM_DISK_PATH'] = '/tmp/test_diskcache'
            cache = get_disk()
            self.assertTrue(cache.get_default_directory().endswith('diskcache_llm'))
            self.assertEqual(repr(cache), 'DiskCache: 0 keys, /tmp/test_diskcache')
            cache['hello'] = 'world'
            self.assertEqual(cache['hello'], 'world')
            self.assertTrue('hello' in cache)

            self.assertEqual(cache.keys(), ['hello'])

            cache.mset({'a': 1, 'b': 2})
            self.assertEqual(cache.mget(['a', 'b']), {'a': 1, 'b': 2})
            cache.delete('hello')
            self.assertFalse(cache.delete('hello'))
            self.assertFalse('hello' in cache)
            cache.clear()
            self.assertEqual(len(cache), 0)
        finally:
            if current_path:
                os.environ['LLM_DISK_PATH'] = current_path
            else:
                del os.environ['LLM_DISK_PATH']
