"""
Contribute Router
Handles community knowledge contributions — submit, list, review.
"""
from fastapi import APIRouter, HTTPException, Query
from app.models.request import ContributeRequest, ContributeReviewRequest
from app.services.db.supabase_client import get_supabase
from app.services.ingestion.ingestor import ingest_document
from app.domains import VALID_DOMAINS, normalize_domain
from datetime import datetime, timezone

router = APIRouter(prefix="/contribute", tags=["contribute"])


@router.post("/")
async def submit_contribution(req: ContributeRequest):
    """Submit a new knowledge contribution for review."""
    domain = normalize_domain(req.domain)
    if domain not in VALID_DOMAINS:
        raise HTTPException(status_code=400, detail=f"Invalid domain: {req.domain}")

    try:
        db = get_supabase()
        result = db.table("contributions").insert({
            "title": req.title,
            "domain": domain,
            "content": req.content,
            "source_url": req.source_url,
            "contributor_name": req.contributor_name,
            "contributor_credentials": req.contributor_credentials,
            "status": "pending",
        }).execute()

        return {
            "id": result.data[0]["id"],
            "title": req.title,
            "status": "pending",
            "message": "Contribution submitted successfully. It will be reviewed soon.",
        }
    except Exception as e:
        print(f"[contribute] Submission failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contribution")


@router.get("/")
async def list_contributions(
    status: str | None = Query(None, description="Filter by status: pending, approved, rejected"),
):
    """List contributions, optionally filtered by status."""
    try:
        db = get_supabase()
        query = db.table("contributions").select("*").order("submitted_at", desc=True)
        if status:
            query = query.eq("status", status)
        result = query.limit(100).execute()
        return result.data
    except Exception as e:
        print(f"[contribute] List failed: {e}")
        return []


@router.get("/{contribution_id}")
async def get_contribution(contribution_id: str):
    """Get a single contribution by ID."""
    try:
        db = get_supabase()
        result = (
            db.table("contributions")
            .select("*")
            .eq("id", contribution_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Contribution not found")


@router.patch("/{contribution_id}")
async def review_contribution(contribution_id: str, req: ContributeReviewRequest):
    """
    Admin: approve or reject a contribution.
    If approved, the content is automatically ingested into the knowledge base.
    """
    try:
        db = get_supabase()

        # Fetch the contribution first
        contrib = (
            db.table("contributions")
            .select("*")
            .eq("id", contribution_id)
            .single()
            .execute()
        )
        if not contrib.data:
            raise HTTPException(status_code=404, detail="Contribution not found")

        # Update status
        now = datetime.now(timezone.utc).isoformat()
        db.table("contributions").update({
            "status": req.status,
            "reviewer_notes": req.reviewer_notes,
            "reviewed_at": now,
        }).eq("id", contribution_id).execute()

        # If approved, ingest into knowledge base
        if req.status == "approved":
            try:
                await ingest_document(
                    title=contrib.data["title"],
                    content=contrib.data["content"],
                    domain=contrib.data["domain"],
                    credibility_tier="community",
                    author=contrib.data.get("contributor_name"),
                    source_url=contrib.data.get("source_url"),
                )
                print(f"[contribute] Ingested approved contribution: {contrib.data['title']}")
            except Exception as ingest_err:
                print(f"[contribute] Ingestion failed for approved contribution: {ingest_err}")
                # Still mark as approved even if ingestion fails
                # Admin can re-trigger ingestion later

        return {
            "id": contribution_id,
            "status": req.status,
            "message": f"Contribution {req.status}.",
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[contribute] Review failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to review contribution")
