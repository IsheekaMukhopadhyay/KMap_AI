import os
from pydantic_settings import BaseSettings
from pydantic import Field, validator

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    # App Gateway Security
    APP_API_KEY: str = Field(..., env='APP_API_KEY')
    JWT_SECRET: str = Field(..., env='JWT_SECRET')
    
    # LLM Providers
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    LLM_PROVIDER: str = "groq"
    
    # In-memory storage parameters
    MAX_FILE_SIZE_MB: int = 20

    class Config:
        env_file = ".env"
        case_sensitive = True

    @validator("APP_API_KEY", "JWT_SECRET")
    def validate_secrets(cls, v):
        if not v or "replace_me" in v:
            raise ValueError("Security secrets must be set in .env and not be default values")
        return v

try:
    settings = Settings()
except Exception as e:
    import sys
    print(f"FATAL CONFIG ERROR: {e}")
    sys.exit(1)
