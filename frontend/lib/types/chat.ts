export type CredibilityTier =
  | "official"
  | "academic"
  | "curated"
  | "community"
  | "web"

export type Confidence = "high" | "medium" | "low"
export type MessageRole = "user" | "assistant"
export type FeedbackScore = 1 | -1 | null

export type Source = {
  title: string
  section?: string
  credibility_tier: CredibilityTier
  similarity: number
  domain: string
  source_type: "knowledge_base" | "web"
  url?: string
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  sources?: Source[]
  confidence?: Confidence
  isStreaming?: boolean
  createdAt: Date
  followUpQuestions?: string[]
  feedback?: FeedbackScore
  conversationId?: string
}

export type Domain = {
  id: string
  label: string
  labelMl: string
  icon: string
}

export type DomainInfo = {
  id: string
  label: string
  label_ml: string
  icon: string
  description: string
  suggested_questions: string[]
  article_count: number
}

export const DOMAINS: Domain[] = [
  { id: "performing-arts", label: "Performing Arts", labelMl: "പ്രകടന കലകൾ", icon: "🎭" },
  { id: "literature", label: "Classical Literature", labelMl: "ക്ലാസിക്കൽ സാഹിത്യം", icon: "📚" },
  { id: "history", label: "History & Heritage", labelMl: "ചരിത്രം & പൈതൃകം", icon: "🏛️" },
  {
    id: "temple-arch",
    label: "Temple Architecture",
    labelMl: "ക്ഷേത്ര വാസ്തുവിദ്യ",
    icon: "⛩️",
  },
  {
    id: "festivals",
    label: "Festivals & Rituals",
    labelMl: "ഉത്സവങ്ങൾ & ആചാരങ്ങൾ",
    icon: "🎪",
  },
  { id: "cuisine", label: "Cuisine", labelMl: "പാചകരീതി", icon: "🍛" },
  { id: "cinema", label: "Malayalam Cinema", labelMl: "മലയാള സിനിമ", icon: "🎬" },
  {
    id: "geography",
    label: "Geography & Nature",
    labelMl: "ഭൂമിശാസ്ത്രം & പ്രകൃതി",
    icon: "🌿",
  },
]

export type RecentThread = {
  id: string
  query: string
  domain: string | null
  createdAt: string
}

export type RetrievalStats = {
  total_documents: number
  total_chunks: number
  documents_by_domain: Record<string, number>
  status?: string
  message?: string
}

export type Contribution = {
  id: string
  title: string
  domain: string
  content: string
  source_url: string | null
  contributor_name: string | null
  contributor_credentials: string | null
  status: "pending" | "approved" | "rejected"
  reviewer_notes: string | null
  submitted_at: string
  reviewed_at: string | null
}

export type ConversationSummary = {
  id: string
  session_id: string
  query: string
  domain: string | null
  created_at: string
}
