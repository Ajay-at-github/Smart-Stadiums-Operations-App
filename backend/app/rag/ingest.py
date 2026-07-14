import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.services.embeddings import GeminiBatchEmbeddings

# ==============================================================================
# Configuration
# ==============================================================================

load_dotenv()

KB_PATH = Path("KnowledgeBase")
COLLECTION_NAME = "stadium_kb"

# ==============================================================================
# Helper Functions
# ==============================================================================


def flatten_json(data, parent_key=""):
    """
    Convert nested JSON into readable text.
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


def extract_id(obj):
    if not isinstance(obj, dict):
        return "UNKNOWN"
    for key, value in obj.items():
        if key == "id" or key.endswith("_id"):
            return str(value)
    return "UNKNOWN"


from google.genai.errors import ClientError


# class GeminiBatchEmbeddings(Embeddings):
#     def __init__(self, model: str = "models/gemini-embedding-2", api_key: str = None):
#         self.model = model
#         self.client = genai.Client(api_key=api_key)

#     def _embed_with_retry(self, contents):
#         for attempt in range(6):
#             try:
#                 return self.client.models.embed_content(
#                     model=self.model,
#                     contents=contents
#                 )
#             except ClientError as e:
#                 if e.code == 429:
#                     sleep_time = (2 ** attempt) + 10
#                     print(f"Rate limited (429). Retrying in {sleep_time}s...")
#                     time.sleep(sleep_time)
#                 else:
#                     raise e
#             except Exception as e:
#                 sleep_time = (2 ** attempt) + 10
#                 print(f"Transient error: {e}. Retrying in {sleep_time}s...")
#                 time.sleep(sleep_time)
#         raise RuntimeError("Failed to embed content after multiple retries due to rate limits.")

#     def embed_documents(self, texts: list[str]) -> list[list[float]]:
#         chunk_size = 350
#         embeddings = []
#         for i in range(0, len(texts), chunk_size):
#             chunk = texts[i:i + chunk_size]
#             contents = [
#                 types.Content(parts=[types.Part.from_text(text=t)])
#                 for t in chunk
#             ]
#             response = self._embed_with_retry(contents)
#             for emb in response.embeddings:
#                 embeddings.append(emb.values)
#             # Add a small delay between batches
#             time.sleep(1.0)
#         return embeddings

#     def embed_query(self, text: str) -> list[float]:
#         response = self._embed_with_retry(text)
#         return response.embeddings[0].values


def load_documents():

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


# ==============================================================================
# Main
# ==============================================================================

def main():

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