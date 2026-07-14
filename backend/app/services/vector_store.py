"""Module containing Qdrant vector database store factory implementation."""

import os

from app.services.embeddings import GeminiBatchEmbeddings
from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

load_dotenv()

COLLECTION_NAME = "stadium_kb"


def get_vector_store() -> QdrantVectorStore:
    """Establish a connection and return a configured QdrantVectorStore.

    Returns:
        An instance of QdrantVectorStore.

    """
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY") or None,
    )

    embeddings = GeminiBatchEmbeddings(
        model="models/gemini-embedding-2",
        api_key=os.getenv("GEMINI_API_KEY"),
    )

    return QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )
