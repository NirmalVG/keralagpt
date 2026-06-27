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
      className="query-outer"
      style={{
        padding: "16px 24px 20px",
        background: "var(--bg-page)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Input container ─────────────────────────── */}
      <div
        className="query-box"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          background: "var(--bg-card)",
          border: focused
            ? "1.5px solid var(--gold-light)"
            : "1.5px solid var(--border-default)",
          borderRadius: 14,
          padding: "10px 12px 10px 16px",
          boxShadow: focused
            ? "var(--shadow-gold)"
            : "var(--shadow-sm)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Sparkle icon */}
        <span
          style={{
            fontSize: 15,
            lineHeight: "36px",
            color: focused ? "var(--gold-mid)" : "var(--text-muted)",
            flexShrink: 0,
            transition: "color 0.2s ease",
            userSelect: "none",
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
            fontSize: 15,
            color: "var(--text-primary)",
            lineHeight: "22px",
            minHeight: 36,
            maxHeight: 140,
            overflowY: "auto",
            padding: "7px 0",
            display: "block",
          }}
        />

        {/* Domain pill (if active) */}
        {activeDomain && (
          <div
            style={{
              flexShrink: 0,
              padding: "4px 10px",
              borderRadius: 100,
              background: "var(--bg-domain-active)",
              border: "1px solid var(--border-gold)",
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--gold-dark)",
              letterSpacing: "0.02em",
              lineHeight: "20px",
              alignSelf: "center",
              whiteSpace: "nowrap",
            }}
          >
            {activeDomain.label}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: canSend
              ? "var(--gold-dark)"
              : "var(--border-subtle)",
            color: canSend ? "#FAF7F2" : "var(--text-muted)",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 600,
            flexShrink: 0,
            transition: "all 0.2s ease",
            transform: canSend ? "scale(1)" : "scale(0.92)",
            boxShadow: canSend ? "var(--shadow-gold)" : "none",
          }}
        >
          {isStreaming ? (
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 13V3M8 3L3 8M8 3L13 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-ui)",
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 10,
          letterSpacing: "0.01em",
        }}
      >
        KeralaGPT can make mistakes. Verify critical historical information.
      </p>
    </div>
  )
}
