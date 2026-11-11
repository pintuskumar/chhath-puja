"""Shared helpers for headless MPFB scripts (run inside Blender)."""
import importlib
import sys


def mpfb(absolute_package_str, key):
    """Blender extensions live at an unknown module path; find MPFB's module by suffix."""
    for amod in list(sys.modules):
        if amod.endswith(absolute_package_str):
            mod = importlib.import_module(amod)
            return getattr(mod, key)
    raise ValueError(f"No module found with name ending in {absolute_package_str}")


def log(*a):
    print("[chhath]", *a, flush=True)
