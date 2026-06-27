"""
Conversations Router
List and retrieve past conversation threads for the sidebar.
"""
from fastapi import APIRouter, Query
from app.services.db.supabase_client import get_supabase

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/")
async def list_conversations(
    limit: int = Query(20, ge=1, le=100),
):
    """
    List recent conversations for the sidebar.
    Returns the first query of each session, ordered by most recent.
    """
    try:
        db = get_supabase()
        result = (
            db.table("conversations")
            .select("id, session_id, query, domain, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        # Deduplicate by session_id — keep only the first query per session
        seen_sessions: set[str] = set()
        unique: list[dict] = []
        for row in result.data:
            sid = row.get("session_id", "")
            if sid and sid not in seen_sessions:
                seen_sessions.add(sid)
                unique.append(row)

        return unique

    except Exception as e:
        print(f"[conversations] List failed: {e}")
        return []


@router.get("/{session_id}")
async def get_conversation(session_id: str):
    """
    Get all messages in a conversation session.
    """
    try:
        db = get_supabase()
        result = (
            db.table("conversations")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at", desc=False)
            .execute()
        )
        return result.data

    except Exception as e:
        print(f"[conversations] Get session failed: {e}")
        return []


@router.delete("/{session_id}")
async def delete_conversation(session_id: str):
    try:
        db = get_supabase()
        db.table("conversations").delete().eq("session_id", session_id).execute()
        return {"status": "ok"}
    except Exception as e:
        print(f"[conversations] Delete failed: {e}")
        return {"status": "ok"}
