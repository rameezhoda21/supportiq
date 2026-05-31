import os
import re
from huggingface_hub import InferenceClient

def get_extractive_fallback(question: str, context_chunks: list[str]) -> str:
    """Fallback extractive QA: returns the best matching sentence from context."""
    if not context_chunks:
        return "I'm sorry, I don't have enough information to answer that. Please contact the business directly."
    
    text = " ".join(context_chunks)
    # Split by periods, exclamation marks, question marks, or newlines
    sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +|\n+', text) if s.strip()]
    if not sentences:
        return "I'm sorry, I don't have enough information to answer that. Please contact the business directly."

    q_words = set(re.findall(r'\w+', question.lower()))
    best_sentence = sentences[0]
    max_overlap = -1
    
    for sentence in sentences:
        s_words = set(re.findall(r'\w+', sentence.lower()))
        overlap = len(q_words.intersection(s_words))
        if overlap > max_overlap:
            max_overlap = overlap
            best_sentence = sentence
            
    return best_sentence

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """
    Generates an answer from Hugging Face using the provided context chunks.
    Falls back to a local extractive method if HF fails.
    """
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    model = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
    
    context = "\n\n".join(context_chunks)
    system_prompt = (
        "You are a customer support assistant for a small business. "
        "Answer using only the provided business information. "
        "If the answer is not in the context, return: "
        "\"I'm sorry, I don't have enough information to answer that. Please contact the business directly.\" "
        "Do not invent shipping times, prices, policies, ingredients, guarantees, or medical claims. "
        "Keep the answer concise and friendly."
    )
    
    if not api_key:
        print("HF Error: HUGGINGFACE_API_KEY is missing. Using extractive fallback.")
        return get_extractive_fallback(question, context_chunks)
        
    try:
        client = InferenceClient(model=model, token=api_key)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Business Information:\n{context}\n\nCustomer Question:\n{question}"}
        ]
        
        # Using chat_completion API for Instruction models
        response = client.chat_completion(messages=messages, max_tokens=150, temperature=0.1)
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"HF Error: {e}")
        return get_extractive_fallback(question, context_chunks)
