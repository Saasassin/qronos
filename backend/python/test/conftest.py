import sys
import os

if "pytest" in sys.modules:
    os.environ["ENV"] = "test"