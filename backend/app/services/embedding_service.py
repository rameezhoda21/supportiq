from sentence_transformers import SentenceTransformer

# Load the model globally so it's not reloaded on every request
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> list[float]:
    """
    Step 2: Generate an embedding using sentence-transformers/all-MiniLM-L6-v2.
    """
    embedding = model.encode(text)
    return embedding.tolist()
