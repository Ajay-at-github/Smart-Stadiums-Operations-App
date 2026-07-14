"""Module for ingesting stadium KnowledgeBase documents into Qdrant Vector Store."""

import json
import os
from pathlib import Path
from typing import List

from app.services.embeddings import GeminiBatchEmbeddings
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

load_dotenv()

KB_PATH = Path("KnowledgeBase")
COLLECTION_NAME = "stadium_kb"


def flatten_json(data: object, parent_key: str = "") -> List[str]:
    """Convert nested JSON into a list of readable lines.

    Args:
        data: Nested JSON object, list, or primitive.
        parent_key: Path key tracking recursion.

    Returns:
        A list of flattened text string representations.

    """
    lines = []

    if isinstance(data, dict):

        for key, value in data.items():

            new_key = f"{parent_key}.{key}" if parent_key else key

            lines.extend(flatten_json(value, new_key))

    elif isinstance(data, list):

        if not data:
            lines.append(f"{parent_key}: []")

        elif all(not isinstance(x, (dict, list)) for x in data):

            lines.append(f"{parent_key}: {', '.join(map(str, data))}")

        else:

            for index, item in enumerate(data):

                lines.extend(
                    flatten_json(item, f"{parent_key}[{index}]")
                )

    else:

        lines.append(f"{parent_key}: {data}")

    return lines


def extract_id(obj: object) -> str:
    """Extract standard identifiers from JSON objects.

    Args:
        obj: The JSON data object.

    Returns:
        The extracted ID string or 'UNKNOWN'.

    """
    if not isinstance(obj, dict):
        return "UNKNOWN"
    for key, value in obj.items():
        if key == "id" or key.endswith("_id"):
            return str(value)
    return "UNKNOWN"


def load_documents() -> List[Document]:
    """Load stadium knowledge base documents from disk.

    Returns:
        A list of parsed Document structures.

    """
    documents = []

    for json_file in KB_PATH.glob("**/*.json"):

        print(f"Loading {json_file}")

        try:

            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

        except json.JSONDecodeError:

            print(f"Skipping invalid JSON: {json_file}")

            continue

        if not isinstance(data, dict):
            continue

        for category, objects in data.items():

            if isinstance(objects, dict):

                objects = [objects]

            elif not isinstance(objects, list):

                continue

            for obj in objects:

                text = "\n".join(flatten_json(obj))

                documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "file": json_file.stem,
                            "category": category,
                            "id": extract_id(obj),
                        },
                    )
                )

    return documents


def main() -> None:
    """Run Qdrant vector database upload pipeline."""
    documents = load_documents()

    print(f"\nCreated {len(documents)} documents.\n")

    embeddings = GeminiBatchEmbeddings(
        model="models/gemini-embedding-2",
        api_key=os.getenv("GEMINI_API_KEY")
    )

    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY") or None,
    )

    collections = client.get_collections().collections

    if COLLECTION_NAME in [c.name for c in collections]:
        print("Recreating collection to update dimension...")
        client.delete_collection(COLLECTION_NAME)

    print("Creating collection...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=3072,
            distance=Distance.COSINE,
        ),
    )

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )

    print("Uploading documents to Qdrant...")

    vector_store.add_documents(documents)

    print(f"Successfully uploaded {len(documents)} documents.")

    print("\nSample Documents:\n")

    for doc in documents[:5]:

        print("=" * 80)
        print(doc.metadata)
        print()
        print(doc.page_content)
        print()


if __name__ == "__main__":
    main()
