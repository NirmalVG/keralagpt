import { create } from "zustand"

export type CredibilityTier = "official" | "academic" | "curated" | "community"
export type Confidence = "high" | "medium" | "low"

export type Source = {
  title: string
  section: string
  credibility_tier: CredibilityTier
  similarity: number
  domain: string
}

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  confidence?: Confidence
  isStreaming?: boolean
  createdAt: Date
}

interface ChatStore {
  messages: Message[]
  isStreaming: boolean
  activeDomain: string | null
  addMessage: (msg: Message) => void
  appendToken: (token: string) => void
  finalizeMessage: (sources: Source[], confidence: Confidence) => void
  setStreaming: (v: boolean) => void
  setDomain: (d: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeDomain: null,

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  // Called on every SSE token — appends to the last assistant message
  appendToken: (token) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === "assistant") {
        // Restore newlines that were escaped for SSE transport
        const text = token.replace(/\\n/g, "\n")
        msgs[msgs.length - 1] = { ...last, content: last.content + text }
      }
      return { messages: msgs }
    }),

  // Called when [SOURCES] event arrives — attaches metadata to last message
  finalizeMessage: (sources, confidence) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          sources,
          confidence,
          isStreaming: false,
        }
      }
      return { messages: msgs }
    }),

  setStreaming: (v) => set({ isStreaming: v }),
  setDomain: (d) => set({ activeDomain: d }),
  clearMessages: () => set({ messages: [] }),
}))
