"""Module containing Gemini API interaction and response generation services."""

import os
import time
from collections import OrderedDict
from typing import Optional

import anyio
import google.generativeai as genai
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.rag_service import rag_service
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


class LRUCache:
    """Thread-safe Least Recently Used (LRU) Cache.

    Implements a Time-To-Live (TTL) expiration mechanism.
    """

    def __init__(self, capacity: int = 200, ttl_seconds: int = 600) -> None:
        """Initialize the cache.

        Args:
            capacity: Maximum number of items stored.
            ttl_seconds: Expiration limit in seconds.

        """
        self.capacity = capacity
        self.ttl = ttl_seconds
        self.cache = OrderedDict()

    def get(self, key: str) -> Optional[str]:
        """Retrieve an item if it exists and is not expired.

        Args:
            key: The normalized query string cache key.

        Returns:
            The cached response value or None.

        """
        if key not in self.cache:
            return None
        value, expiry = self.cache[key]
        if time.time() > expiry:
            del self.cache[key]
            return None
        self.cache.move_to_end(key)
        return value

    def set(self, key: str, value: str) -> None:
        """Insert or update a query response string in the cache.

        Args:
            key: The normalized query string cache key.
            value: The response string to cache.

        """
        if key in self.cache:
            del self.cache[key]
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)
        self.cache[key] = (value, time.time() + self.ttl)


chat_cache = LRUCache(capacity=200, ttl_seconds=600)


def normalize_query(query: str) -> str:
    """Clean, strip, lowercase, and spacing-normalize query string.

    Makes caching keys matching-friendly.

    Args:
        query: The user query string.

    Returns:
        The normalized query string.

    """
    return " ".join(query.strip().lower().split())


def build_prompt(user_query: str, context: str) -> str:
    """Format prompt context with instructions and parsed retrieval blocks.

    Args:
        user_query: The cleaned user query.
        context: Formatted relevant document blocks.

    Returns:
        The fully formatted prompt string.

    """
    return f"""
{SYSTEM_PROMPT}

==================================================
RETRIEVED STADIUM KNOWLEDGE
==================================================

{context}

==================================================
USER QUESTION
==================================================

{user_query}

==================================================
ANSWER
==================================================
"""


async def generate_response(message: str) -> str:
    """Fetch and generate a response for a user message.

    Utilizes LRU caching, RAG vector retrieval, and Gemini inference.

    Args:
        message: The user query string.

    Returns:
        The generated assistant response string.

    """
    normalized = normalize_query(message)
    cached_reply = chat_cache.get(normalized)
    if cached_reply is not None:
        return cached_reply

    # Run blocking similarity search in thread pool
    rag_result = await anyio.to_thread.run_sync(
        rag_service.retrieve_context, message
    )

    context = rag_result["context"]

    prompt = build_prompt(user_query=message, context=context)

    # Run blocking Gemini model generation in thread pool
    response = await anyio.to_thread.run_sync(
        model.generate_content, prompt
    )

    reply = response.text
    chat_cache.set(normalized, reply)
    return reply
