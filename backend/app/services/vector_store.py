import os
from pinecone import Pinecone, ServerlessSpec
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Pinecone client
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "supportiq-docs")
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")

pc = None
index = None

if PINECONE_API_KEY and PINECONE_INDEX_NAME:
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Check if index exists, though usually handled out-of-band. 
        # (Assuming it's pre-created or we just connect to it)
        index = pc.Index(PINECONE_INDEX_NAME)
    except Exception as e:
        logger.error(f"Failed to initialize Pinecone: {e}")
else:
    logger.warning("Pinecone API Key or Index Name is missing. Vector search will be disabled.")


def upsert_document_chunks(business_id: int, document_id: int, chunks: list[str], embeddings: list[list[float]], source: str = "Unknown"):
    """
    Upsert document chunks and their embeddings into Pinecone.
    SQLite/PostgreSQL stores the app data, while Pinecone only stores the embeddings
    and minimal metadata for vector similarity search.
    """
    if not index:
        logger.error("Pinecone index is not initialized.")
        raise ValueError("Pinecone index not initialized. Missing API key or configuration.")

    if len(chunks) != len(embeddings):
        raise ValueError("Number of chunks must match number of embeddings.")

    vectors_to_upsert = []
    for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
        # Create a unique ID for the vector
        vector_id = f"biz_{business_id}_doc_{document_id}_chunk_{idx}"
        
        # Store essential metadata in Pinecone
        metadata = {
            "business_id": str(business_id),  # Used for filtering
            "document_id": str(document_id),
            "chunk_index": idx,
            "chunk_text": chunk_text,
            "source": source
        }
        
        vectors_to_upsert.append((vector_id, embedding, metadata))

    # Upsert in batches of 100 to respect Pinecone limits
    batch_size = 100
    upserted_count = 0
    try:
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i:i + batch_size]
            upsert_response = index.upsert(vectors=batch)
            print(f"Pinecone upsert response: {upsert_response}")
            upserted_count += len(batch)
    except Exception as e:
        logger.error(f"Failed during index.upsert to Pinecone: {e}", exc_info=True)
        raise
        
    logger.info(f"Successfully upserted {upserted_count} vectors into Pinecone.")
    return upserted_count


def search_similar_chunks(business_id: int, query_embedding: list[float], top_k: int = 5) -> dict:
    """
    Search Pinecone for the top_k most relevant chunks for a specific business_id.
    """
    if not index:
        logger.error("Pinecone index is not initialized.")
        return {}

    try:
        # Perform vector similarity search, strictly isolating to the business_id
        response = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter={"business_id": {"$eq": str(business_id)}}
        )
        
        # Format the results to match what rag_service expects
        documents = []
        distances = []
        metadatas = []
        
        for match in response.get("matches", []):
            # Pinecone score is usually cosine similarity (0 to 1, higher is better)
            # We map this to distances as Chroma used (if higher is better, we configure rag_service to handle it)
            distances.append(match.get("score", 0.0))
            meta = match.get("metadata", {})
            documents.append(meta.get("chunk_text", ""))
            metadatas.append(meta)
            
        return {
            "documents": [documents],
            "distances": [distances],
            "metadatas": [metadatas]
        }
    except Exception as e:
        logger.error(f"Pinecone search failed: {e}")
        return {}
