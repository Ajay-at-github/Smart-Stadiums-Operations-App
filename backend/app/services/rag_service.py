"""Module containing RAG matching and retrieval service implementation."""

from typing import Any, List, Tuple

from app.services.vector_store import get_vector_store
from qdrant_client.models import FieldCondition, Filter, MatchValue

TOP_K = 5


def detect_categories_and_files(query: str) -> Tuple[List[str], List[str]]:
    """Classify user query into relevant stadium categories and files.

    Used to assist the hybrid search retriever.

    Args:
        query: The user query string.

    Returns:
        A tuple of (categories, files) detected.

    """
    query_lower = query.lower()
    categories: List[str] = []
    files: List[str] = []

    # Parking
    if any(
        w in query_lower
        for w in ["park", "car", "vehicle", "parking", "garage"]
    ):
        files.append("parking")
        categories.append("parking")

    # Gates / Entrances
    if any(
        w in query_lower
        for w in ["gate", "entrance", "entry", "exit", "turnstile"]
    ):
        files.append("gates")
        categories.append("gates")

    # Accessibility
    if any(
        w in query_lower
        for w in [
            "wheelchair",
            "accessible",
            "disability",
            "accessibility",
            "elevator",
            "escalator",
            "ramp",
        ]
    ):
        files.append("accessibility")
        categories.append("accessibility")

    # Emergency / Medical
    if any(
        w in query_lower
        for w in [
            "emergency",
            "medical",
            "first aid",
            "doctor",
            "ambulance",
            "police",
            "security",
            "fire",
            "evacuate",
            "evacuation",
        ]
    ):
        files.append("emergency")
        categories.append("emergency")

    # Rules
    if any(
        w in query_lower
        for w in [
            "rule",
            "allow",
            "prohibit",
            "bring",
            "forbidden",
            "bag",
            "camera",
            "food policy",
            "drone",
            "weapon",
        ]
    ):
        files.append("rules")
        categories.append("rules")

    # Transportation
    if any(
        w in query_lower
        for w in [
            "bus",
            "train",
            "metro",
            "transit",
            "taxi",
            "shuttle",
            "transportation",
            "uber",
            "lyft",
        ]
    ):
        files.append("transportation")
        categories.append("transportation")

    # Events & Schedule
    if any(
        w in query_lower
        for w in [
            "schedule",
            "match",
            "game",
            "time",
            "date",
            "when",
            "play",
            "tournament",
            "announcement",
            "news",
        ]
    ):
        files.extend(["schedule", "announcements"])
        categories.extend(["schedule", "announcements"])

    # FAQ
    if any(w in query_lower for w in ["faq", "question", "frequently asked"]):
        files.append("faq")
        categories.append("faq")

    return categories, files


class RAGService:
    """Service for executing Retrieval-Augmented Generation context matching.

    Matches query contents against Qdrant Vector Store payload indexes.
    """

    def __init__(self) -> None:
        """Initialize the RAG service and connect to the Vector Store."""
        self.vector_store = get_vector_store()

    def retrieve(self, query: str, k: int = TOP_K) -> List[Any]:
        """Retrieve documents from Qdrant using a hybrid approach.

        Combines semantic matching with a metadata category filter query.

        Args:
            query: The user query string.
            k: The maximum number of documents to retrieve.

        Returns:
            A list of retrieved document objects.

        """
        categories, files = detect_categories_and_files(query)

        # 1. Broad semantic search (fallback & context richness)
        semantic_k = max(2, k - 2)
        docs_semantic = self.vector_store.similarity_search(
            query, k=semantic_k
        )

        if not files:
            return docs_semantic

        # 2. Targeted filtered search to boost category-specific precision
        conditions = [
            FieldCondition(key="metadata.file", match=MatchValue(value=f))
            for f in files
        ]

        try:
            qdrant_filter = Filter(should=conditions)
            docs_filtered = self.vector_store.similarity_search(
                query, k=k, filter=qdrant_filter
            )

            # Merge results: prioritize filtered matches for precise context,
            # then append semantic fallbacks to maintain context richness.
            seen_ids = set()
            merged_docs = []

            for doc in docs_filtered:
                doc_id = doc.metadata.get("id") or doc.page_content
                if doc_id not in seen_ids:
                    seen_ids.add(doc_id)
                    merged_docs.append(doc)

            for doc in docs_semantic:
                doc_id = doc.metadata.get("id") or doc.page_content
                if doc_id not in seen_ids:
                    seen_ids.add(doc_id)
                    merged_docs.append(doc)

            return merged_docs[:k]

        except Exception as e:
            # Defensive fallback to semantic search if Qdrant filter fails
            print(f"Filter search failed: {e}")
            return self.vector_store.similarity_search(query, k=k)

    def build_context(self, documents: List[Any]) -> str:
        """Convert retrieved documents into a prompt-ready context block.

        Args:
            documents: A list of retrieved document objects.

        Returns:
            A formatted prompt-ready context string.

        """
        if not documents:
            return "No relevant stadium knowledge was found."

        sections = []

        for i, doc in enumerate(documents, start=1):

            metadata = doc.metadata

            sections.append(
                f"""
==============================
Document {i}

ID: {metadata.get("id")}
Category: {metadata.get("category")}
Source: {metadata.get("file")}

{doc.page_content}
""".strip()
            )

        return "\n\n".join(sections)

    def retrieve_context(self, query: str, k: int = TOP_K) -> dict:
        """Execute context retrieval matching for the Gemini prompt.

        Args:
            query: The user query string.
            k: The maximum number of documents to retrieve.

        Returns:
            A dictionary containing documents and the formatted context.

        """
        docs = self.retrieve(query, k)
        context = self.build_context(docs)

        return {"documents": docs, "context": context}


rag_service = RAGService()
