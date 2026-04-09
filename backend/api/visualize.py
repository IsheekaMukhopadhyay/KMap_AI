from fastapi import APIRouter, HTTPException, Depends
from api.upload import map_data_sessions
from core.security import get_api_key

router = APIRouter()

@router.get("/visualize/{session_id}", dependencies=[Depends(get_api_key)])
async def get_visualization_data(session_id: str):
    if session_id not in map_data_sessions:
        raise HTTPException(status_code=404, detail="Map data not found for session")
    
    return map_data_sessions[session_id]
