from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ingestion.ingestor import ingest_document
from app.domains import VALID_DOMAINS, normalize_domain

router = APIRouter(prefix="/ingest", tags=["ingestion"])


class IngestRequest(BaseModel):
    title: str
    content: str
    domain: str
    credibility_tier: str = "curated"
    author: str | None = None
    source_url: str | None = None
    language: str = "en"
    title_ml: str | None = None
    metadata: dict | None = None


@router.post("/document")
async def ingest_document_endpoint(req: IngestRequest):
    domain = normalize_domain(req.domain)
    if domain not in VALID_DOMAINS:
        raise HTTPException(status_code=400, detail=f"Invalid domain: {req.domain}")

    valid_tiers = ["official", "academic", "curated", "community"]
    if req.credibility_tier not in valid_tiers:
        raise HTTPException(status_code=400, detail=f"Invalid credibility_tier")

    result = await ingest_document(
        title=req.title,
        content=req.content,
        domain=domain,
        credibility_tier=req.credibility_tier,
        author=req.author,
        source_url=req.source_url,
        language=req.language,
        title_ml=req.title_ml,
        metadata=req.metadata or {},
    )
    return result
