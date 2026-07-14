# ruff: noqa: E402
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Set mock env variables before imports
import os
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

os.environ["GEMINI_API_KEY"] = "mock-key"
os.environ["QDRANT_URL"] = "http://localhost:6333"

# Mock the embedding model to avoid calling Google API during test setup
import google.generativeai as genai

genai.Client = MagicMock()
genai.GenerativeModel = MagicMock()

# Mock QdrantClient and QdrantVectorStore before importing main
import qdrant_client

qdrant_client.QdrantClient = MagicMock()

import langchain_qdrant

langchain_qdrant.QdrantVectorStore = MagicMock()

from app.main import app
from app.services.gemini_service import chat_cache


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear LRU Cache before each test."""
    chat_cache.cache.clear()

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)
