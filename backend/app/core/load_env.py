import os
from functools import lru_cache

from dotenv import load_dotenv


@lru_cache(maxsize=1)
def _env() -> dict:
    """
    Lightweight env loader that avoids `pydantic-settings`.

    - Loads `.env` if present
    - Returns a dict of normalized env values
    """
    load_dotenv()
    return {
        "data_base_url": os.getenv("data_base_url", ""),
        "secret_key": os.getenv("secret_key", ""),
        "algorithm": os.getenv("algorithm", "HS256"),
        "access_token_expire_minutes": int(os.getenv("access_token_expire_minutes", "30") or "30"),
        "cors_origins": os.getenv("CORS_ORIGINS", "http://localhost:3000"),
    }


def get_database_url() -> str:
    return _env()["data_base_url"]


def get_secret_key() -> str:
    return _env()["secret_key"]


def get_algorithm() -> str:
    return _env()["algorithm"]


def get_token_expire_minutes() -> int:
    return _env()["access_token_expire_minutes"]


def get_cors_origins() -> list[str]:
    raw = _env()["cors_origins"]
    return [item.strip() for item in raw.split(",") if item.strip()]
