import os
import sys
import pytest

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import init_db

@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Initialize DB tables automatically for test suite execution."""
    init_db()
