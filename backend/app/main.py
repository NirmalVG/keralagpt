from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import ingestion, retrieval, chat

load_dotenv()

app = FastAPI(
    title="KeralaGPT API",
    description="Kerala Cultural Intelligence Platform — Backend",
    version="0.1.0",
)

# CORS — allows your Next.js frontend (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion.router)
app.include_router(retrieval.router)
app.include_router(chat.router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "KeralaGPT API"}

@app.get("/health/db")
async def health_db():
    from app.services.db.supabase_client import get_supabase
    try:
        db = get_supabase()
        result = db.table("documents").select("id").limit(1).execute()
        return {"status": "ok", "db": "connected", "documents": len(result.data)}
    except Exception as e:
        return {"status": "error", "message": str(e)}