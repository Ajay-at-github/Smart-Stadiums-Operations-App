import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.vector_store import get_vector_store

vector_store = get_vector_store()

results = vector_store.similarity_search(
    "wheelchair accessible entrance North zone",
    k=10,
)

target_ids = ["AE-01", "AE-02", "WC-01", "AD-01"]
docs_by_id = {}
for doc in results:
    doc_id = doc.metadata.get("id")
    if doc_id in target_ids:
        docs_by_id[doc_id] = doc

if "AE-01" in docs_by_id:
    doc = docs_by_id["AE-01"]
    accessibility_type = "Accessible Entrance"
    zone = "North"
    for line in doc.page_content.split("\n"):
        if line.startswith("accessibility_type:"):
            accessibility_type = line.split(":", 1)[1].strip()
        elif line.startswith("zone:"):
            zone = line.split(":", 1)[1].strip()
    
    print("AE-01")
    print(f"{accessibility_type} {zone}")
    print()

if "AE-02" in docs_by_id:
    print("AE-02")
    print()

if "WC-01" in docs_by_id:
    print("WC-01")
    print()

if "AD-01" in docs_by_id:
    print("AD-01")