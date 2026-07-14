import time
from typing import Any, List, Union

from google import genai
from google.genai import types
from google.genai.errors import ClientError
from langchain_core.embeddings import Embeddings


class GeminiBatchEmbeddings(Embeddings):
    """
    LangChain compatible embeddings class that calls Google Gemini's
    embed_content API in batches and implements transient error retry logic.
    """
    def __init__(
        self,
        model: str = "models/gemini-embedding-2",
        api_key: str | None = None,
    ) -> None:
        """
        Initialize the embedding client.
        
        Args:
            model: The Gemini embedding model name.
            api_key: The Google GenAI API key.
        """
        self.model = model
        self.client = genai.Client(api_key=api_key)

    def _embed_with_retry(self, contents: Union[str, List[types.Content]]) -> Any:
        """
        Call the embedding API with exponential backoff on transient/rate-limiting errors.
        
        Args:
            contents: A single text string or list of types.Content objects.
            
        Returns:
            The raw API response containing embedding vectors.
        """
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

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of document strings in batches.
        
        Args:
            texts: A list of text strings to embed.
            
        Returns:
            A list of float lists representing embedding vectors.
        """
        chunk_size = 350
        vectors: List[List[float]] = []

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

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a single user query string.
        
        Args:
            text: A text query string.
            
        Returns:
            A list of floats representing the embedding vector.
        """
        response = self._embed_with_retry(text)
        return response.embeddings[0].values