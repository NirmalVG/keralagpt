"use client"
// components/chat/QueryInput.tsx
import { useState, useRef } from "react"
import { useChat } from "@/lib/hooks/useChat"
import { useChatStore } from "@/lib/store/chatStore"

export function QueryInput() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const { sendMessage } = useChat()
  const { isStreaming, activeDomain } = useChatStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = query.trim().length > 0 && !isStreaming

  const handleSend = () => {
    if (!canSend) return
    sendMessage(query.trim())
    setQuery("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 140) + "px"
  }

  return (
    <div
      style={{
        padding: "12px 28px 24px",
        maxWidth: 820,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* ── Input container ─────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          background: "var(--bg-elevated)",
          border: focused
            ? "1.5px solid var(--gold-light)"
            : "1.5px solid var(--border-default)",
          borderRadius: 16,
          padding: "12px 12px 12px 18px",
          boxShadow: focused ? "var(--shadow-gold)" : "var(--shadow-sm)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Sparkle / search icon */}
        <span
          style={{
            fontSize: 16,
            color: focused ? "var(--gold-mid)" : "var(--text-muted)",
            flexShrink: 0,
            marginBottom: 4,
            transition: "color 0.2s ease",
          }}
        >
          ✦
        </span>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            activeDomain
              ? `Ask about Kerala's ${activeDomain.label.toLowerCase()}...`
              : "Ask about Kerala's history, arts, or culture..."
          }
          rows={1}
          disabled={isStreaming}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            resize: "none",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-primary)",
            lineHeight: 1.6,
            minHeight: 24,
            maxHeight: 140,
            overflowY: "auto",
          }}
        />

        {/* Domain pill (if active) */}
        {activeDomain && (
          <div
            style={{
              flexShrink: 0,
              padding: "3px 8px",
              borderRadius: 100,
              background: "var(--bg-domain-active)",
              border: "1px solid var(--border-gold)",
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--gold-dark)",
              letterSpacing: "0.03em",
              marginBottom: 2,
            }}
          >
            {activeDomain.label}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: canSend ? "var(--gold-dark)" : "var(--border-subtle)",
            color: canSend ? "#FAF7F2" : "var(--text-muted)",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            transition: "all 0.2s ease",
            transform: canSend ? "scale(1)" : "scale(0.95)",
            boxShadow: canSend ? "var(--shadow-gold)" : "none",
          }}
        >
          {isStreaming ? (
            // Animated loading dot
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "currentColor",
                animation: "pulse-dot 1s ease infinite",
              }}
            />
          ) : (
            "↑"
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          color: "var(--text-muted)",
          marginTop: 8,
        }}
      >
        KeralaGPT can make mistakes. Verify critical historical information.
      </p>
    </div>
  )
}
