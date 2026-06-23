"use client"
// lib/hooks/useChat.ts
import { useChatStore } from "@/lib/store/chatStore"
import type { Source, Confidence } from "@/lib/types/chat"

export function useChat() {
  const {
    addMessage,
    appendToken,
    finalizeMessage,
    setStreaming,
    activeDomain,
    sessionId,
  } = useChatStore()

  const sendMessage = async (query: string) => {
    // 1. Optimistic user message — appears instantly
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date(),
    })

    // 2. Blank assistant placeholder — fills via stream
    const assistantId = crypto.randomUUID()
    addMessage({
      id: assistantId,
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
        body: JSON.stringify({
          query,
          domain: activeDomain?.id ?? null,
          session_id: sessionId,
        }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let streamDone = false
      let followUps: string[] = []

      while (!streamDone) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          const payload = event
            .split("\n")
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.slice(6))
            .join("\n")

          if (payload === "[DONE]") {
            streamDone = true
            break
          }

          // Parse follow-up questions
          if (payload.startsWith("[FOLLOWUPS]")) {
            const json = payload.slice(11, payload.lastIndexOf("[/FOLLOWUPS]"))
            try {
              followUps = JSON.parse(json)
            } catch {
              followUps = []
            }
            continue
          }

          if (payload.startsWith("[SOURCES]")) {
            const json = payload.slice(9, payload.lastIndexOf("[/SOURCES]"))
            try {
              const sources: Source[] = JSON.parse(json)
              const content =
                useChatStore.getState().messages.at(-1)?.content ?? ""
              const lower = content.toLowerCase()
              const confidence: Confidence = lower.includes("confidence: high")
                ? "high"
                : lower.includes("confidence: low")
                  ? "low"
                  : "medium"
              finalizeMessage(sources, confidence, followUps)
            } catch {
              finalizeMessage([], "medium", followUps)
            }
            continue
          }

          appendToken(payload)
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      appendToken("\n\n*Connection error — please try again.*")
    } finally {
      const lastMessage = useChatStore.getState().messages.at(-1)
      if (lastMessage?.role === "assistant" && lastMessage.isStreaming) {
        finalizeMessage(lastMessage.sources ?? [], lastMessage.confidence ?? "medium", lastMessage.followUpQuestions)
      }
      setStreaming(false)
    }
  }

  return { sendMessage }
}
