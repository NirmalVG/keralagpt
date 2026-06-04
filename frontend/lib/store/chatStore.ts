import { create } from "zustand"
import type { Confidence, Domain, Message, Source } from "@/lib/types/chat"

export type { Message } from "@/lib/types/chat"

interface ChatStore {
  messages: Message[]
  isStreaming: boolean
  activeDomain: Domain | null
  isDark: boolean
  addMessage: (msg: Message) => void
  appendToken: (token: string) => void
  finalizeMessage: (sources: Source[], confidence: Confidence) => void
  setStreaming: (v: boolean) => void
  setDomain: (d: Domain | null) => void
  toggleTheme: () => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeDomain: null,
  isDark: false,

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
  toggleTheme: () =>
    set(() => {
      const isDark = !document.documentElement.classList.contains("dark")
      document.documentElement.classList.toggle("dark", isDark)
      localStorage.setItem("keralagpt-theme", isDark ? "dark" : "light")
      return { isDark }
    }),
  clearMessages: () => set({ messages: [] }),
}))
