import faiss
import numpy as np
import openai
from sentence_transformers import SentenceTransformer
from core.config import settings

# Global dictionary to store FAISS instances in memory based on session
sessions = {}

# Initialize local embedding model. all-MiniLM-L6-v2 is small and fast.
# We do it globally so it's only loaded into memory once.
embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    return embedding_model

def get_openai_client():
    if settings.LLM_PROVIDER == "openrouter":
        return openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
    # Default to Groq
    return openai.OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=settings.GROQ_API_KEY,
    )

def get_model_name():
    if settings.LLM_PROVIDER == "openrouter":
        return "google/gemma-3-12b-it:free"
    return "llama-3.1-8b-instant"

def embed_text(text_chunks: list[str]) -> np.ndarray:
    """Uses local SentenceTransformer to embed text chunks."""
    model = get_embedding_model()
    embeddings = model.encode(text_chunks)
    return np.array(embeddings, dtype=np.float32)

def create_faiss_index(session_id: str, text_chunks: list[str]):
    vectors = embed_text(text_chunks)
    dimension = vectors.shape[1]
    
    # Initialize FAISS index
    index = faiss.IndexFlatL2(dimension)
    index.add(vectors)
    
    sessions[session_id] = {
        "index": index,
        "chunks": text_chunks
    }
    
    return True

def query_rag(session_id: str, query: str, top_k: int = 3) -> dict:
    """Strict RAG inference."""
    if session_id not in sessions:
        return {"answer": "The answer is not available in the provided document. (Session expired)", "sources": []}
        
    session_data = sessions[session_id]
    index = session_data["index"]
    chunks = session_data["chunks"]
    
    # Embed the query
    query_vector = embed_text([query])
    
    # Search FAISS
    distances, indices = index.search(query_vector, top_k)
    
    retrieved_context = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
             retrieved_context.append(chunks[idx])
             
    if not retrieved_context:
        return {"answer": "The answer is not available in the provided document.", "sources": []}

    context_str = "\n".join(retrieved_context)
    
    # STRICT Prompt
    prompt = f"""
You are a strict, precise academic assistant.

Context information is below.
---------------------
{context_str}
---------------------

Given ONLY the context information and not prior knowledge, answer the query.
If the answer is not contained in the context, you MUST say exactly: "The answer is not available in the provided document." DO NOT hallucinate.

Query: {query}
Answer:
"""
    
    client = get_openai_client()
    model_name = get_model_name()
    
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.0
    )
    
    return {
        "answer": response.choices[0].message.content,
        "sources": retrieved_context
    }

def generate_document_intro(session_id: str) -> str:
    """Uses the LLM to generate an initial summary and extract questions from the document chunks."""
    if session_id not in sessions:
        return "Session expired."
        
    chunks = sessions[session_id]["chunks"]
    if not chunks:
        return "No readable text found in this document."
        
    # Sample the beginning and the end of the document (up to 5 chunks total)
    # This helps catch introductory topics and concluding exercises.
    sample_chunks = chunks[:3]
    if len(chunks) > 3:
        sample_chunks.extend(chunks[-2:])
        
    sample_text = "\n\n".join(sample_chunks)
    
    prompt = f"""
You are an academic assistant analyzing a newly loaded document.
Below are excerpts (beginning and end) from the document:
---------------------
{sample_text}
---------------------

Your task is to warmly greet the user, and provide:
1. A brief 1-2 sentence overview/introduction of what topic, subject, or chapter this document is about.
2. A neatly formatted bulleted list of any specific questions, exercises, or assignment problems found in the text. (If none are found, just say "No specific exercise questions were found.")

Format the response using Markdown.
"""

    client = get_openai_client()
    model_name = get_model_name()
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Summary Generation Error ({settings.LLM_PROVIDER}):", str(e))
        return "Document loaded securely in memory. How can I help you regarding this paper?"

