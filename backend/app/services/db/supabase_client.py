from supabase import create_client, Client
from app.config import settings

_client: Client | None = None

def get_supabase() -> Client:
    """
    Returns a singleton Supabase client using the service_role key.
    
    service_role key bypasses Row Level Security — safe for backend only.
    NEVER expose this key to the frontend or browser.
    The anon key is for client-side operations (future auth flows).
    """
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env"
            )
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client