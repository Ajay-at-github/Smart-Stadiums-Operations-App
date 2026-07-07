import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore

from app.services.embeddings import GeminiBatchEmbeddings

load_dotenv()

COLLECTION_NAME = "stadium_kb"


def get_vector_store():

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
