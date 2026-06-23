"use client"
// components/chat/MessageBubble.tsx
import type { Message } from "@/lib/store/chatStore"
import { FeedbackButtons } from "./FeedbackButtons"
import { FollowUpQuestions } from "./FollowUpQuestions"

interface Props {
  message: Message
  isLast?: boolean
}

const CONFIDENCE_CONFIG = {
  high: {
    label: "High Confidence",
    color: "#1A6B3C",
    bg: "rgba(26,107,60,0.08)",
  },
  medium: {
    label: "Medium Confidence",
    color: "#9B6820",
    bg: "rgba(155,104,32,0.08)",
  },
  low: {
    label: "Low Confidence",
    color: "#8B2010",
    bg: "rgba(139,32,16,0.08)",
  },
}

export function MessageBubble({ message, isLast }: Props) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
          animation: "fade-up 0.25s ease-out",
        }}
      >
        <div
          style={{
            maxWidth: "62%",
            padding: "12px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px 16px 4px 16px",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--text-primary)",
              lineHeight: 1.6,
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  // ── Assistant message ──────────────────────────────
  const confidence = message.confidence
    ? CONFIDENCE_CONFIG[message.confidence]
    : null

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        animation: "fade-up 0.3s ease-out",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background:
            "linear-gradient(135deg, var(--gold-light), var(--gold-mid))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          flexShrink: 0,
          marginTop: 2,
          boxShadow: "var(--shadow-xs)",
        }}
      >
        ◉
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: "82%",
          padding: "16px 18px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "4px 16px 16px 16px",
          boxShadow: "var(--shadow-sm)",
          flex: 1,
        }}
      >
        {/* Message text */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--text-primary)",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
          }}
          className={message.isStreaming ? "streaming-cursor" : ""}
        >
          {/* Render inline citations [N] with gold styling */}
          {renderWithCitations(message.content)}
        </div>

        {/* Confidence badge */}
        {confidence && !message.isStreaming && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 12,
              padding: "3px 8px",
              borderRadius: 100,
              background: confidence.bg,
              border: `1px solid ${confidence.color}30`,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: confidence.color,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                fontWeight: 500,
                color: confidence.color,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {confidence.label}
            </span>
          </div>
        )}

        {/* Feedback buttons — show on every completed assistant message */}
        {!message.isStreaming && (
          <FeedbackButtons
            messageId={message.id}
            currentFeedback={message.feedback}
            conversationId={message.conversationId}
          />
        )}

        {/* Follow-up questions — show on last assistant message only */}
        {isLast &&
          !message.isStreaming &&
          message.followUpQuestions &&
          message.followUpQuestions.length > 0 && (
            <FollowUpQuestions questions={message.followUpQuestions} />
          )}
      </div>
    </div>
  )
}

/* ── Inline citation renderer ─────────────────────────────── */
function renderWithCitations(content: string) {
  // Match [N] or [N,M] citation patterns
  const parts = content.split(/(\[\d+(?:,\d+)*\])/g)
  return parts.map((part, i) => {
    if (/^\[\d+(?:,\d+)*\]$/.test(part)) {
      return (
        <sup
          key={i}
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 9,
            fontWeight: 600,
            color: "var(--gold-mid)",
            background: "rgba(200,149,42,0.12)",
            padding: "1px 4px",
            borderRadius: 3,
            marginLeft: 1,
            cursor: "pointer",
          }}
          title="View source"
        >
          {part}
        </sup>
      )
    }
    return <span key={i}>{part}</span>
  })
}
