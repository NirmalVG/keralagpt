"use client"
// components/chat/ChatInterface.tsx
import { useEffect, useRef } from "react"
import { useChatStore } from "@/lib/store/chatStore"
import { HeroGreeting } from "./HeroGreeting"
import { MessageBubble } from "./MessageBubble"
import { QueryInput } from "./QueryInput"
import { DOMAINS } from "@/lib/types/chat"

export function ChatInterface() {
  const { messages, activeDomain, setDomain } = useChatStore()
  const hasMessages = messages.length > 0
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Domain Pills ──────────────────────────────── */}
      <div
        style={{
          padding: "14px 28px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: hasMessages ? "1px solid var(--border-subtle)" : "none",
          overflowX: "auto",
        }}
      >
        {DOMAINS.map((domain) => {
          const isActive = activeDomain?.id === domain.id
          return (
            <button
              key={domain.id}
              onClick={() => setDomain(isActive ? null : domain)}
              style={{
                padding: "6px 14px",
                borderRadius: 100,
                border: isActive
                  ? "1.5px solid var(--gold-light)"
                  : "1px solid var(--border-default)",
                background: isActive ? "var(--bg-pill-active)" : "transparent",
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--gold-dark)" : "var(--text-secondary)",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border-gold)"
                  e.currentTarget.style.color = "var(--gold-dark)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border-default)"
                  e.currentTarget.style.color = "var(--text-secondary)"
                }
              }}
            >
              {domain.label}
            </button>
          )
        })}
      </div>

      {/* ── Main content area ─────────────────────────── */}
      {!hasMessages ? (
        <HeroGreeting />
      ) : (
        <>
          {/* Session pill */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "14px 0 8px",
            }}
          >
            <div
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                color: "var(--text-muted)",
                letterSpacing: "0.02em",
              }}
            >
              Session initialized · Ancient Era Context Loaded
            </div>
          </div>

          {/* Message thread */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 28px 16px",
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        </>
      )}

      {/* ── Query Input ───────────────────────────────── */}
      <QueryInput />
    </main>
  )
}
