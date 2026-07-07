from app.services.vector_store import get_vector_store

TOP_K = 5


class RAGService:
    def __init__(self):
        self.vector_store = get_vector_store()

    def retrieve(self, query: str, k: int = TOP_K):
        """
        Retrieve the most relevant documents from Qdrant.
        """
        return self.vector_store.similarity_search(query, k=k)

    def build_context(self, documents):
        """
        Convert retrieved documents into a prompt-ready context block.
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

    def retrieve_context(self, query: str, k: int = TOP_K):
        """
        Convenience method used by Gemini.
        """
        docs = self.retrieve(query, k)
        context = self.build_context(docs)

        return {
            "documents": docs,
            "context": context
        }


rag_service = RAGService()