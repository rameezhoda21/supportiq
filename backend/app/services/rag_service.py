from app.services.embedding_service import generate_embedding
from app.services.vector_store import search_local_chunks, search_similar_chunks
from app.services.llm_service import generate_answer


def flatten_results(results: dict) -> list[dict]:
    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    flattened = []
    for index, document in enumerate(documents):
        if not document:
            continue
        flattened.append(
            {
                "document": document,
                "score": distances[index] if index < len(distances) else 0.0,
                "metadata": metadatas[index] if index < len(metadatas) else {},
            }
        )
    return flattened


def combine_results(*result_sets: dict, top_k: int = 5) -> dict:
    combined = []
    seen = set()

    for results in result_sets:
        for item in flatten_results(results):
            key = (
                item["metadata"].get("document_id"),
                item["metadata"].get("chunk_index"),
                item["document"][:120],
            )
            if key in seen:
                continue
            seen.add(key)
            combined.append(item)

    combined.sort(key=lambda item: item["score"], reverse=True)
    top_matches = combined[:top_k]

    return {
        "documents": [[item["document"] for item in top_matches]],
        "distances": [[item["score"] for item in top_matches]],
        "metadatas": [[item["metadata"] for item in top_matches]],
    }


def ask_rag_pipeline(business_id: int, question: str, db=None) -> dict:
    """
    RAG Pipeline matching the exact specified flow.
    """
    # Step 1 & 2: Generate an embedding using a placeholder embedding function first
    question_embedding = generate_embedding(question)

    # Step 3: Search Pinecone for the top 5 most relevant chunks for that business_id
    results = search_similar_chunks(business_id, question_embedding, top_k=5)
    if db is not None:
        local_results = search_local_chunks(db, business_id, question_embedding, top_k=5, query_text=question)
        results = combine_results(results, local_results, top_k=5)

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[0.0]])[0]
    metadatas = results.get("metadatas", [[{}]])[0]

    # Calculate a similarity/confidence score
    # Pinecone utilizes Cosine similarity natively, where score is between 0 and 1 (1 being exact match). 
    # The 'distances' list now holds the Pinecone/local cosine similarity score directly.
    confidence_score = distances[0] if distances and len(distances) > 0 else 0.0

    # Step 4: If the similarity score is low, return the fallback response
    if confidence_score < 0.25:
        return {
            "answer": "I'm sorry, I don't have enough information to answer that. Please contact the business directly.",
            "sources": [],
            "confidence_score": round(confidence_score, 2),
            "was_answered": False
        }

    # Isolate unique source names to trace referencing back
    sources = list(set([str(meta.get("source", "Unknown File")) for meta in metadatas if meta]))

    # Step 6: Use the LLM service to generate answer
    answer = generate_answer(question, documents)

    # Step 7: Return final generated payload to the router layer
    return {
        "answer": answer,
        "sources": sources,
        "confidence_score": round(confidence_score, 2),
        "was_answered": True
    }
