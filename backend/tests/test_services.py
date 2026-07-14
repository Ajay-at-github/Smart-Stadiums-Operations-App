import pytest
import time
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.gemini_service import LRUCache, normalize_query, build_prompt, generate_response
from app.services.rag_service import RAGService
from langchain_core.documents import Document


def test_lru_cache_basic():
    """Test LRU Cache retrieval, insertion, and eviction."""
    cache = LRUCache(capacity=3, ttl_seconds=10)
    
    cache.set("key1", "val1")
    cache.set("key2", "val2")
    cache.set("key3", "val3")
    
    assert cache.get("key1") == "val1"
    
    # key1 is now most recently used. set key4 to evict key2 (oldest)
    cache.set("key4", "val4")
    assert cache.get("key2") is None
    assert cache.get("key1") == "val1"
    assert cache.get("key3") == "val3"
    assert cache.get("key4") == "val4"


def test_lru_cache_ttl():
    """Test LRU Cache expiration rules."""
    cache = LRUCache(capacity=5, ttl_seconds=2)
    cache.set("temp", "val")
    
    assert cache.get("temp") == "val"
    
    # Mock passage of time
    with patch("time.time", return_value=time.time() + 5):
        assert cache.get("temp") is None


def test_query_normalization():
    """Test text stripping, lowercasing, and spacing normalization."""
    assert normalize_query("  Where is GATE  A?  ") == "where is gate a?"
    assert normalize_query("\nHello \t World\n") == "hello world"


def test_rag_context_builder_empty():
    """Verify RAG context returns expected text when no documents match query."""
    service = RAGService()
    context = service.build_context([])
    assert context == "No relevant stadium knowledge was found."


def test_rag_context_builder_populated():
    """Verify context structure matches RAG prompt format standards."""
    service = RAGService()
    docs = [
        Document(
            page_content="Accessibility info details",
            metadata={"id": "AE-01", "category": "accessibility", "file": "accessibility.json"}
        )
    ]
    context = service.build_context(docs)
    assert "Document 1" in context
    assert "ID: AE-01" in context
    assert "Category: accessibility" in context
    assert "Accessibility info details" in context


@pytest.mark.asyncio
@patch("app.services.gemini_service.model.generate_content")
@patch("app.services.gemini_service.rag_service.retrieve_context")
async def test_generate_response_caching(mock_retrieve, mock_gen_content):
    """Ensure Gemini generate_response caches results and does not double-fetch."""
    mock_retrieve.return_value = {"context": "Mock retrieved info", "documents": []}
    
    mock_resp = MagicMock()
    mock_resp.text = "Answer from model"
    mock_gen_content.return_value = mock_resp
    
    # First call (cache miss)
    resp1 = await generate_response("where is the gate?")
    assert resp1 == "Answer from model"
    assert mock_gen_content.call_count == 1
    assert mock_retrieve.call_count == 1
    
    # Second call (cache hit) - should reuse cache and not invoke Gemini or RAG again
    resp2 = await generate_response("where is the gate?")
    assert resp2 == "Answer from model"
    assert mock_gen_content.call_count == 1
    assert mock_retrieve.call_count == 1


def test_query_classification():
    """Verify that detect_categories_and_files classifies query namespaces correctly."""
    from app.services.rag_service import detect_categories_and_files
    
    cats, files = detect_categories_and_files("Where is parking zone A?")
    assert "parking" in cats
    assert "parking" in files
    
    cats, files = detect_categories_and_files("Tell me about accessibility services.")
    assert "accessibility" in cats
    assert "accessibility" in files
    
    cats, files = detect_categories_and_files("Can I bring a camera?")
    assert "rules" in cats
    assert "rules" in files


def test_rag_hybrid_retrieval():
    """Verify that retrieve executes filtered hybrid queries and falls back safely."""
    service = RAGService()
    
    # Mock vector store similarity search
    service.vector_store.similarity_search = MagicMock()
    
    # When query has no target keywords
    service.retrieve("hello stadium")
    # Should only run normal semantic search once
    assert service.vector_store.similarity_search.call_count == 1
    
    service.vector_store.similarity_search.reset_mock()
    
    # When query has keywords, should run semantic search AND filtered search
    service.retrieve("Where to park my car?")
    # Should execute two queries (semantic and filtered)
    assert service.vector_store.similarity_search.call_count == 2

