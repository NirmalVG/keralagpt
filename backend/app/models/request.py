"""
Pydantic request models for all KeralaGPT API endpoints.
"""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str
    domain: str | None = None
    top_k: int = 5
    session_id: str | None = None


class ContributeRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    domain: str
    content: str = Field(..., min_length=20)
    source_url: str | None = None
    contributor_name: str | None = None
    contributor_credentials: str | None = None


class ContributeReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    reviewer_notes: str | None = None


class FeedbackRequest(BaseModel):
    conversation_id: str
    feedback_score: int = Field(..., ge=-1, le=1)
    report_text: str | None = None
