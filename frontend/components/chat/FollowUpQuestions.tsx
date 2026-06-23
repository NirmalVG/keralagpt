"use client"
// components/chat/FollowUpQuestions.tsx
import { useChat } from "@/lib/hooks/useChat"
import { useChatStore } from "@/lib/store/chatStore"

interface Props {
  questions: string[]
}

export function FollowUpQuestions({ questions }: Props) {
  const { sendMessage } = useChat()
  const { isStreaming } = useChatStore()

  if (!questions || questions.length === 0) return null

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
        animation: "fade-up 0.4s ease-out",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          width: "100%",
          marginBottom: 2,
        }}
      >
        Follow up
      </span>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => !isStreaming && sendMessage(q)}
          disabled={isStreaming}
          style={{
            padding: "7px 14px",
            borderRadius: 100,
            border: "1px solid var(--border-default)",
            background: "var(--bg-elevated)",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-secondary)",
            cursor: isStreaming ? "not-allowed" : "pointer",
            opacity: isStreaming ? 0.5 : 1,
            transition: "all 0.2s ease",
            lineHeight: 1.4,
            textAlign: "left",
            maxWidth: "100%",
          }}
          onMouseEnter={(e) => {
            if (!isStreaming) {
              e.currentTarget.style.borderColor = "var(--border-gold)"
              e.currentTarget.style.color = "var(--gold-dark)"
              e.currentTarget.style.background = "var(--gold-subtle)"
              e.currentTarget.style.transform = "translateY(-1px)"
              e.currentTarget.style.boxShadow = "var(--shadow-xs)"
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)"
            e.currentTarget.style.color = "var(--text-secondary)"
            e.currentTarget.style.background = "var(--bg-elevated)"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <span style={{ marginRight: 6, opacity: 0.6 }}>→</span>
          {q}
        </button>
      ))}
    </div>
  )
}
