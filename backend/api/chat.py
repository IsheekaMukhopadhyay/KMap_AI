from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from services.rag_pipeline import query_rag
from core.security import get_api_key
import re

router = APIRouter()

# UUID Regex for basic validation
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.I)

class ChatRequest(BaseModel):
    session_id: str = Field(..., pattern=r'^[0-9a-fA-F-]+$')
    query: str = Field(..., min_length=1, max_length=500)

@router.post("/chat", dependencies=[Depends(get_api_key)])
async def chat_with_document(request: ChatRequest):
    try:
        result = query_rag(request.session_id, request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{session_id}", dependencies=[Depends(get_api_key)])
async def get_document_summary(session_id: str):
    try:
        from services.rag_pipeline import generate_document_intro
        summary = generate_document_intro(session_id)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
