import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    app_name: str = "AgroChain API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    class Config:
        env_file = ".env"
        extra = "allow"
        case_sensitive = False

settings = Settings()