import io
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Reads PDF dynamically in memory without persisting to disk."""
    reader = PdfReader(io.BytesIO(file_bytes))
    full_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text.append(text)
    return "\n".join(full_text)

def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> list[str]:
    """Basic recursive character/semantic splitting for chunks."""
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        if end >= text_length:
            chunks.append(text[start:])
            break
        
        # Try to find a good breaking point (like a newline or period)
        break_point = end
        for char in ['\n', '.', ' ']:
            last_index = text.rfind(char, start, end)
            if last_index != -1 and last_index > start + (chunk_size // 2):
                break_point = last_index + 1
                break
        
        chunks.append(text[start:break_point].strip())
        start = break_point - overlap # Move start by chunk - overlap

    # Filter out very short chunks
    return [c for c in chunks if len(c) > 50]
