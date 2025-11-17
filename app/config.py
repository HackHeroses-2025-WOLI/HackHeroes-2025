"""Application configuration using environment variables."""
from typing import List
import os
from pathlib import Path

from dotenv import load_dotenv

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


# Load local `.env` into environment early so Settings and other code
# pick up values from it during import (won't override real env vars).
repo_root = Path(__file__).resolve().parents[1]
env_path = repo_root / ".env"
if env_path.exists():
    load_dotenv(env_path, override=False)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    # Allow extra env vars so runtime-only secrets (e.g. SECRET_KEY)
    # that are intentionally not declared here do not cause validation errors.
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")
    
    # Application
    APP_NAME: str = "HackHeroes API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security
    # NOTE: SECRET_KEY is intentionally NOT declared here so it is never
    # provided as a default or committed in the repo. Read it from the
    # environment at runtime via `get_secret_key()` below.
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite:///./users.db"
    
    # CORS - will be parsed from comma-separated string
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8080"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
def get_secret_key() -> str:
    """Read SECRET_KEY from environment (not from config file).

    Raises RuntimeError if SECRET_KEY is not set to fail loudly in deployment.
    """
    sk = os.getenv("SECRET_KEY")
    if sk:
        return sk

    # Try loading `.env` from repo root where `run.py` is located — this
    # is allowed for local development (test/dev). Do not override an
    # already present env var.
    repo_root = Path(__file__).resolve().parents[1]
    env_path = repo_root / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=False)
        sk = os.getenv("SECRET_KEY")
        if sk:
            return sk

    raise RuntimeError(
        "SECRET_KEY must be set in environment (do NOT store it in repo)."
    )


# Global settings instance
settings = Settings()
