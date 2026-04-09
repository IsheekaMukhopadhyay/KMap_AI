import requests
import json

UPLOAD_URL = "http://127.0.0.1:8000/api/upload"
CHAT_URL = "http://127.0.0.1:8000/api/chat"

try:
    print("Uploading PDF...")
    with open("e:/RAG_PDF/backend/test.pdf", "rb") as f:
        res = requests.post(UPLOAD_URL, files={"file": ("test.pdf", f, "application/pdf")})
    
    if res.status_code == 200:
        session_id = res.json().get("session_id")
        print("Session ID:", session_id)
        
        print("Sending chat request...")
        chat_res = requests.post(CHAT_URL, json={
            "session_id": session_id,
            "query": "what is the module name"
        })
        print("Chat status:", chat_res.status_code)
        print("Chat response:", chat_res.text)
        
except Exception as e:
    print("Error:", e)
