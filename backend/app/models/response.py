"""
Pydantic response models for KeralaGPT API.
"""
from pydantic import BaseModel


class DomainInfo(BaseModel):
    id: str
    label: str
    label_ml: str
    icon: str
    description: str
    suggested_questions: list[str]
    article_count: int


class ContributionResponse(BaseModel):
    id: str
    title: str
    domain: str
    content: str
    source_url: str | None = None
    contributor_name: str | None = None
    contributor_credentials: str | None = None
    status: str
    reviewer_notes: str | None = None
    submitted_at: str
    reviewed_at: str | None = None


class ConversationSummary(BaseModel):
    id: str
    session_id: str
    query: str
    domain: str | None = None
    created_at: str


class FeedbackStats(BaseModel):
    total: int
    positive: int
    negative: int
    reports: int
