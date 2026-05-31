import fitz  # PyMuPDF
from typing import List

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text content from a PDF file using PyMuPDF (fitz)."""
    text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    if not text.strip():
        raise ValueError("Extracted text is empty.")
    
    return text

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extracts string via decoding from a TXT file byte stream."""
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            # Fallback for Windows typically
            text = file_bytes.decode("latin-1")
        except Exception as e:
            raise ValueError(f"Failed to decode TXT file: {str(e)}")
    
    if not text.strip():
        raise ValueError("Extracted text is empty.")
        
    return text

def chunk_text(text: str, target_chunk_size: int = 600, overlap: int = 150) -> List[str]:
    """
    Splits text into chunks of roughly `target_chunk_size` words.
    `overlap` controls how many words overlap between adjacent chunks to maintain context.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + target_chunk_size]
        chunks.append(" ".join(chunk_words))
        # Move forward, taking overlap into account
        i += target_chunk_size - overlap

    return chunks
