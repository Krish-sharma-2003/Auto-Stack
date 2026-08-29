from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Sanity check on startup
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not set in .env")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY not set in .env")
