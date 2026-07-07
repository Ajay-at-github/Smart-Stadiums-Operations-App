import time

from google import genai
from google.genai import types
from google.genai.errors import ClientError
from langchain_core.embeddings import Embeddings


class GeminiBatchEmbeddings(Embeddings):
    def __init__(
        self,
        model: str = "models/gemini-embedding-2",
        api_key: str | None = None,
    ):
        self.model = model
        self.client = genai.Client(api_key=api_key)

    def _embed_with_retry(self, contents):
        for attempt in range(6):
            try:
                return self.client.models.embed_content(
                    model=self.model,
                    contents=contents,
                )

            except ClientError as e:
                if e.code == 429:
                    wait = (2 ** attempt) + 10
                    print(f"Rate limited. Retrying in {wait}s...")
                    time.sleep(wait)
                else:
                    raise

            except Exception as e:
                wait = (2 ** attempt) + 10
                print(f"Retrying after error: {e}")
                time.sleep(wait)

        raise RuntimeError("Embedding failed after multiple retries.")

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        chunk_size = 350
        vectors = []

        for i in range(0, len(texts), chunk_size):

            batch = texts[i:i + chunk_size]

            contents = [
                types.Content(
                    parts=[types.Part.from_text(text=t)]
                )
                for t in batch
            ]

            response = self._embed_with_retry(contents)

            vectors.extend(
                [embedding.values for embedding in response.embeddings]
            )

            time.sleep(1)

        return vectors

    def embed_query(self, text: str) -> list[float]:
        response = self._embed_with_retry(text)
        return response.embeddings[0].values