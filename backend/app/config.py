import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")          
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "") 
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    NOMIC_API_KEY: str = os.getenv("NOMIC_API_KEY", "")
    NOMIC_EMBED_URL: str = os.getenv("NOMIC_EMBED_URL", "https://api-atlas.nomic.ai/v1/embedding/text")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")

settings = Settings()