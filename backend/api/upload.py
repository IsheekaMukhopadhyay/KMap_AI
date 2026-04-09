import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from services.pdf_parser import extract_text_from_pdf, chunk_text
from services.rag_pipeline import create_faiss_index
from services.ml_engine import process_clusters
from core.config import settings
from core.security import get_api_key

router = APIRouter()

# Global dictionary to store clustered map data
map_data_sessions = {}

@router.post("/upload", dependencies=[Depends(get_api_key)])
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read into memory
    file_bytes = await file.read()
    
    # File size validation
    if len(file_bytes) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
        
    try:
        text = extract_text_from_pdf(file_bytes)
        chunks = chunk_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text found in PDF.")
        
        session_id = str(uuid.uuid4())
        
        # In a background task or directly (directly for demo simplicity)
        create_faiss_index(session_id, chunks)
        
        # Process ML Clusters for knowledge map
        cluster_data = process_clusters(chunks)
        map_data_sessions[session_id] = cluster_data
        
        return {
            "message": "File processed successfully",
            "session_id": session_id,
            "chunks_processed": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
