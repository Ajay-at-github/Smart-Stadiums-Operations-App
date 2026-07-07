import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.rag_service import rag_service

result = rag_service.retrieve_context(
    "Where can I charge my phone?"
)

print(result["context"])