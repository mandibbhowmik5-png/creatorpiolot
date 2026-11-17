import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
MEDIA_DIR = DATA_DIR / "media"
EXPORTS_DIR = DATA_DIR / "exports"
THUMBNAILS_DIR = MEDIA_DIR / "thumbnails"

# Ensure directories exist
for path in [DATA_DIR, MEDIA_DIR, EXPORTS_DIR, THUMBNAILS_DIR]:
    path.mkdir(parents=True, exist_ok=True)

# Free Tier Environment Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
DB_PATH = DATA_DIR / "creatorpilot.db"

# Free Limits & Quotas
YOUTUBE_DAILY_QUOTA_LIMIT = 10000
MAX_VIDEO_DURATION_SECONDS = 3600  # 1 hour
DEFAULT_TENSION_SAMPLE_RATE_SEC = 2.0
