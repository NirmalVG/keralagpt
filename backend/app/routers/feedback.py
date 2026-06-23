"""
Feedback Router
Handles answer quality feedback — thumbs up/down + inaccuracy reports.
"""
from fastapi import APIRouter, HTTPException
from app.models.request import FeedbackRequest
from app.services.db.supabase_client import get_supabase

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/")
async def submit_feedback(req: FeedbackRequest):
    """
    Submit feedback for a conversation.
    feedback_score: 1 (thumbs up), -1 (thumbs down), 0 (neutral/removed)
    report_text: optional inaccuracy report
    """
    try:
        db = get_supabase()

        update_data: dict = {"feedback_score": req.feedback_score}
        if req.report_text:
            update_data["report_text"] = req.report_text

        # Try updating the conversations table
        result = (
            db.table("conversations")
            .update(update_data)
            .eq("id", req.conversation_id)
            .execute()
        )

        # If no row matched, the conversation_id might not exist yet
        # (feedback can come before conversation is persisted)
        # In that case, store it in a separate feedback table or silently succeed
        if not result.data:
            # Try inserting into a feedback_log table as fallback
            try:
                db.table("feedback_log").insert({
                    "conversation_id": req.conversation_id,
                    "feedback_score": req.feedback_score,
                    "report_text": req.report_text,
                }).execute()
            except Exception:
                # If feedback_log table doesn't exist either, just log it
                print(f"[feedback] No conversation found for {req.conversation_id}, logged locally")

        return {"status": "ok", "message": "Feedback recorded"}

    except Exception as e:
        print(f"[feedback] Failed to record feedback: {e}")
        # Don't fail the request — feedback is non-critical
        return {"status": "ok", "message": "Feedback noted"}


@router.get("/stats")
async def feedback_stats():
    """Admin: aggregated feedback metrics."""
    try:
        db = get_supabase()
        result = db.table("conversations").select("feedback_score, report_text").execute()

        total = 0
        positive = 0
        negative = 0
        reports = 0

        for row in result.data:
            score = row.get("feedback_score")
            if score is not None and score != 0:
                total += 1
                if score > 0:
                    positive += 1
                else:
                    negative += 1
            if row.get("report_text"):
                reports += 1

        return {
            "total": total,
            "positive": positive,
            "negative": negative,
            "reports": reports,
        }

    except Exception as e:
        print(f"[feedback] Stats query failed: {e}")
        return {"total": 0, "positive": 0, "negative": 0, "reports": 0}
