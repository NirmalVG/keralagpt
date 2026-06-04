export type CredibilityTier =
  | "official"
  | "academic"
  | "curated"
  | "community"
  | "web"

export type Confidence = "high" | "medium" | "low"
export type MessageRole = "user" | "assistant"

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
}

export type Domain = {
  id: string
  label: string
  labelMl: string
  icon: string
}

export const DOMAINS: Domain[] = [
  { id: "performing-arts", label: "Performing Arts", labelMl: "പ്രകടന കലകൾ", icon: "PA" },
  { id: "literature", label: "Classical Literature", labelMl: "ക്ലാസിക്കൽ സാഹിത്യം", icon: "LI" },
  { id: "history", label: "History & Heritage", labelMl: "ചരിത്രം & പൈതൃകം", icon: "HI" },
  {
    id: "temple-arch",
    label: "Temple Architecture",
    labelMl: "ക്ഷേത്ര വാസ്തുവിദ്യ",
    icon: "TA",
  },
  {
    id: "festivals",
    label: "Festivals & Rituals",
    labelMl: "ഉത്സവങ്ങൾ & ആചാരങ്ങൾ",
    icon: "FR",
  },
  { id: "cuisine", label: "Cuisine", labelMl: "പാചകരീതി", icon: "CU" },
  { id: "cinema", label: "Malayalam Cinema", labelMl: "മലയാള സിനിമ", icon: "CI" },
  {
    id: "geography",
    label: "Geography & Nature",
    labelMl: "ഭൂമിശാസ്ത്രം & പ്രകൃതി",
    icon: "GE",
  },
]

export type RecentThread = {
  id: string
  query: string
  domain: string
  color: string
  createdAt: Date
}
