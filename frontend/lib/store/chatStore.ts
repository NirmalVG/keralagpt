import { create } from "zustand"
import type { Confidence, ConversationSummary, Domain, FeedbackScore, Message, Source } from "@/lib/types/chat"

export type { Message } from "@/lib/types/chat"

interface ChatStore {
  messages: Message[]
  isStreaming: boolean
  activeDomain: Domain | null
  isDark: boolean
  sessionId: string
  conversations: ConversationSummary[]
  sidebarOpen: boolean
  sourcePanelOpen: boolean
  addMessage: (msg: Message) => void
  appendToken: (token: string) => void
  finalizeMessage: (sources: Source[], confidence: Confidence, followUps?: string[]) => void
  setStreaming: (v: boolean) => void
  setDomain: (d: Domain | null) => void
  toggleTheme: () => void
  clearMessages: () => void
  setFeedback: (messageId: string, score: FeedbackScore) => void
  setConversations: (convos: ConversationSummary[]) => void
  toggleSidebar: () => void
  toggleSourcePanel: () => void
  setSidebarOpen: (v: boolean) => void
  setSourcePanelOpen: (v: boolean) => void
}

function generateSessionId(): string {
  return crypto.randomUUID()
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeDomain: null,
  isDark: false,
  sessionId: generateSessionId(),
  conversations: [],
  sidebarOpen: true,
  sourcePanelOpen: true,

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
  finalizeMessage: (sources, confidence, followUps) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === "assistant") {
        // Strip CONFIDENCE and FOLLOW_UP lines from displayed content
        let content = last.content
        content = content.replace(/\n*CONFIDENCE:\s*(High|Medium|Low)\s*/gi, "")
        content = content.replace(/\n*FOLLOW_UP:\s*.+$/gim, "")
        content = content.trim()

        msgs[msgs.length - 1] = {
          ...last,
          content,
          sources,
          confidence,
          isStreaming: false,
          followUpQuestions: followUps,
        }
      }
      return { messages: msgs }
    }),

  setStreaming: (v) => set({ isStreaming: v }),
  setDomain: (d) => set({ activeDomain: d }),
  toggleTheme: () =>
    set(() => {
      const isDark = !document.documentElement.classList.contains("dark")
      document.documentElement.classList.toggle("dark", isDark)
      localStorage.setItem("keralagpt-theme", isDark ? "dark" : "light")
      return { isDark }
    }),
  clearMessages: () =>
    set({
      messages: [],
      sessionId: generateSessionId(),
    }),
  setFeedback: (messageId, score) =>
    set((s) => {
      const msgs = s.messages.map((m) =>
        m.id === messageId ? { ...m, feedback: score } : m
      )
      return { messages: msgs }
    }),
  setConversations: (convos) => set({ conversations: convos }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSourcePanel: () => set((s) => ({ sourcePanelOpen: !s.sourcePanelOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setSourcePanelOpen: (v) => set({ sourcePanelOpen: v }),
}))
