from fastapi import Security, HTTPException, status, Request
from fastapi.security.api_key import APIKeyHeader
from core.config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
import time

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Centralized Limiter
limiter = Limiter(key_func=get_remote_address)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key == settings.APP_API_KEY:
        return api_key
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials. Invalid API Key."
    )

async def security_headers_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Simple CSP (Restrictive)
    # Allows self and local development origins
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:8000"
    
    response.headers["X-Process-Time"] = str(process_time)
    return response

def rate_limit_error_handler(request: Request, exc):
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Rate limit exceeded. Please slow down."
    )
