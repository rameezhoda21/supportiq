import os
import re

import httpx

FALLBACK_MESSAGE = "I'm sorry, I don't have enough information to answer that. Please contact the business directly."


def split_context_sentences(text: str) -> list[str]:
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned) if s.strip()]


def content_words(text: str) -> set[str]:
    stop_words = {
        "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
        "does", "for", "from", "have", "how", "i", "in", "is", "it", "of",
        "on", "or", "our", "that", "the", "their", "this", "to", "what",
        "when", "where", "who", "why", "with", "you", "your", "there"
    }
    return set(re.findall(r'[a-z0-9]+', text.lower())) - stop_words


def extract_numbered_items(text: str) -> list[str]:
    items = re.findall(r'\(\d+\)\s*(.*?)(?=\s*\(\d+\)|$)', text)
    cleaned_items = []
    for item in items:
        cleaned = re.sub(r'\s+', ' ', item).strip(" .")
        cleaned = re.sub(r'(?:\s+\d){2,}$', '', cleaned).strip()
        if cleaned:
            cleaned_items.append(cleaned)
    return cleaned_items


def get_seller_central_answer(question: str, text: str) -> str | None:
    if "seller central" not in question.lower() or "seller central" not in text.lower():
        return None

    lower_text = text.lower()
    start = lower_text.find("what is seller central")
    if start == -1:
        start = lower_text.find("get to know seller central")
    if start == -1:
        start = lower_text.find("seller central")

    end = lower_text.find("the amazon seller app", start)
    section = text[start:end if end != -1 else start + 2200]
    section = re.sub(r'\s+', ' ', section).strip()

    sentences = split_context_sentences(section)
    definition_sentences = [
        sentence for sentence in sentences
        if any(phrase in sentence.lower() for phrase in ["go-to resource", "portal", "one-stop shop", "where you list"])
    ]
    definition = " ".join(definition_sentences[:3]).strip()

    items = extract_numbered_items(section)
    if not definition and not items:
        return None

    lines = []
    if definition:
        lines.append(definition)
    if items:
        lines.append("")
        lines.append("You can use Seller Central to:")
        lines.extend([f"- {item}" for item in items[:6]])

    return "\n".join(lines)


def get_extractive_fallback(question: str, context_chunks: list[str]) -> str:
    """Fallback QA: returns a readable answer from the strongest context sentences."""
    if not context_chunks:
        return FALLBACK_MESSAGE
    
    text = " ".join(context_chunks)
    seller_central_answer = get_seller_central_answer(question, text)
    if seller_central_answer:
        return seller_central_answer

    sentences = split_context_sentences(text)
    if not sentences:
        return FALLBACK_MESSAGE

    q_words = content_words(question)
    scored_sentences = []
    
    for index, sentence in enumerate(sentences):
        s_words = content_words(sentence)
        overlap = len(q_words.intersection(s_words))
        if overlap > 0:
            scored_sentences.append((overlap, -index, sentence))

    if not scored_sentences:
        return FALLBACK_MESSAGE

    scored_sentences.sort(reverse=True)
    selected = [sentence for _, _, sentence in scored_sentences[:4]]
    selected = [re.sub(r'\s+', ' ', sentence).strip() for sentence in selected]

    if len(selected) == 1:
        return selected[0]

    return "Based on the document:\n" + "\n".join([f"- {sentence}" for sentence in selected])

def generate_answer(question: str, context_chunks: list[str]) -> str:
    """
    Generates a structured answer using Groq's OpenAI-compatible chat API.
    Falls back to local extractive QA if the API is not configured or fails.
    """
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    context = "\n\n".join(context_chunks)
    system_prompt = (
        "You are SupportIQ, a careful customer support assistant. "
        "Use ONLY the provided retrieved business/document context. "
        "Do not use outside knowledge. Do not invent policies, prices, timelines, claims, or details. "
        f"If the context does not answer the question, respond exactly: \"{FALLBACK_MESSAGE}\" "
        "Write clear, structured answers. Prefer this format when useful:\n"
        "Short answer: one concise sentence.\n"
        "Details:\n- Bullet point\n- Bullet point\n"
        "Keep the answer friendly and easy to scan."
    )
    
    if not api_key:
        print("Groq is not configured. Set GROQ_API_KEY to use llama-3.3-70b-versatile. Using local fallback.")
        return get_extractive_fallback(question, context_chunks)
        
    try:
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": (
                            f"Retrieved context:\n{context}\n\n"
                            f"Customer question:\n{question}\n\n"
                            "Answer using only the retrieved context."
                        ),
                    },
                ],
                "temperature": 0.1,
                "max_tokens": 500,
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()
        return answer or get_extractive_fallback(question, context_chunks)
    except Exception as e:
        print(f"Groq Error: {e}")
        return get_extractive_fallback(question, context_chunks)
