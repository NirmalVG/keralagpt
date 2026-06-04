"use client"
import {
  useChatStore,
  type Source,
  type Confidence,
} from "@/lib/store/chatStore"

export function useChat() {
  const {
    addMessage,
    appendToken,
    finalizeMessage,
    setStreaming,
    activeDomain,
  } = useChatStore()

  const sendMessage = async (query: string) => {
    // 1. Add user message immediately for instant UI feedback
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date(),
    })

    // 2. Add blank assistant message — tokens will fill it
    addMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isStreaming: true,
      createdAt: new Date(),
    })

    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, domain: activeDomain }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        const lines = raw.split("\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
          const payload = line.slice(6) // strip "data: "

          if (payload === "[DONE]") break

          // Sources event — parse and finalize the message
          if (payload.startsWith("[SOURCES]")) {
            const json = payload.slice(9, payload.lastIndexOf("[/SOURCES]"))
            try {
              const sources: Source[] = JSON.parse(json)
              // Extract confidence from current message content
              const currentContent =
                useChatStore.getState().messages.at(-1)?.content ?? ""
              const lower = currentContent.toLowerCase()
              const confidence: Confidence = lower.includes("confidence: high")
                ? "high"
                : lower.includes("confidence: low")
                  ? "low"
                  : "medium"
              finalizeMessage(sources, confidence)
            } catch {
              finalizeMessage([], "medium")
            }
            continue
          }

          // Regular token — append to message
          appendToken(payload)
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      appendToken("\n\n[Error: Failed to get response. Please try again.]")
    } finally {
      setStreaming(false)
    }
  }

  return { sendMessage }
}
