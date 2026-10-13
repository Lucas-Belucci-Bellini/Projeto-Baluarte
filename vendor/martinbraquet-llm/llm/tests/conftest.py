import os
import pathlib
from contextlib import contextmanager

import pytest

from llm.utils import is_windows_os


@contextmanager
def set_posix_windows():
    if not is_windows_os():
        yield
        return

    posix_backup = pathlib.PosixPath
    try:
        pathlib.PosixPath = pathlib.WindowsPath
        yield
    finally:
        pathlib.PosixPath = posix_backup


@pytest.fixture(autouse=True)
def change_test_dir(request):
    # Get the directory of the current test file
    test_dir = os.path.dirname(request.fspath)
    # Save the current working directory
    original_dir = os.getcwd()
    # Change to the test file's directory
    os.chdir(test_dir)

    with set_posix_windows():
        yield

    # After the test finishes, change back to the original directory
    os.chdir(original_dir)
