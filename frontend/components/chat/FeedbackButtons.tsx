"use client"
// components/chat/FeedbackButtons.tsx
import { useState } from "react"
import { useChatStore } from "@/lib/store/chatStore"
import type { FeedbackScore } from "@/lib/types/chat"

interface Props {
  messageId: string
  currentFeedback: FeedbackScore | undefined
  conversationId?: string
}

export function FeedbackButtons({ messageId, currentFeedback, conversationId }: Props) {
  const { setFeedback } = useChatStore()
  const [showReport, setShowReport] = useState(false)
  const [reportText, setReportText] = useState("")
  const [reportSent, setReportSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleFeedback = async (score: 1 | -1) => {
    // Toggle off if same score clicked again
    const newScore = currentFeedback === score ? null : score
    setFeedback(messageId, newScore)

    // Send to backend
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId ?? messageId,
          feedback_score: newScore ?? 0,
        }),
      })
    } catch {
      // Silently fail — feedback is non-critical
    }

    // Show report option on thumbs down
    if (score === -1 && newScore === -1) {
      setShowReport(true)
    } else {
      setShowReport(false)
    }
  }

  const handleReport = async () => {
    if (!reportText.trim()) return
    setSending(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId ?? messageId,
          feedback_score: -1,
          report_text: reportText.trim(),
        }),
      })
      setReportSent(true)
      setTimeout(() => {
        setShowReport(false)
        setReportSent(false)
      }, 2000)
    } catch {
      // Silently fail
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      {/* Thumb buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <FeedbackBtn
          icon="👍"
          isActive={currentFeedback === 1}
          onClick={() => handleFeedback(1)}
          label="Helpful"
        />
        <FeedbackBtn
          icon="👎"
          isActive={currentFeedback === -1}
          onClick={() => handleFeedback(-1)}
          label="Not helpful"
        />
        {!showReport && !currentFeedback && (
          <button
            onClick={() => setShowReport(true)}
            style={{
              marginLeft: 8,
              padding: "3px 8px",
              borderRadius: 100,
              border: "1px solid var(--border-subtle)",
              background: "transparent",
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--crimson)"
              e.currentTarget.style.color = "var(--crimson)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)"
              e.currentTarget.style.color = "var(--text-muted)"
            }}
          >
            ⚑ Report inaccuracy
          </button>
        )}
      </div>

      {/* Report inaccuracy panel */}
      {showReport && !reportSent && (
        <div
          style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-elevated)",
            animation: "fade-up 0.2s ease-out",
          }}
        >
          <label
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 6,
            }}
          >
            What&apos;s inaccurate?
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Describe the inaccuracy..."
            rows={2}
            style={{
              width: "100%",
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              background: "var(--bg-card)",
              padding: "8px 10px",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--text-primary)",
              resize: "vertical",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button
              onClick={handleReport}
              disabled={sending || !reportText.trim()}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background:
                  sending || !reportText.trim()
                    ? "var(--border-subtle)"
                    : "var(--crimson)",
                color: "#fff",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                fontWeight: 500,
                cursor:
                  sending || !reportText.trim() ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "Sending..." : "Submit Report"}
            </button>
            <button
              onClick={() => {
                setShowReport(false)
                setReportText("")
              }}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "1px solid var(--border-default)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report sent confirmation */}
      {reportSent && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(26,107,60,0.08)",
            border: "1px solid rgba(26,107,60,0.2)",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--jade)",
            animation: "fade-up 0.2s ease-out",
          }}
        >
          ✓ Report submitted. Thank you for improving KeralaGPT.
        </div>
      )}
    </div>
  )
}

function FeedbackBtn({
  icon,
  isActive,
  onClick,
  label,
}: {
  icon: string
  isActive: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: isActive
          ? "1.5px solid var(--gold-light)"
          : "1px solid var(--border-subtle)",
        background: isActive ? "var(--gold-subtle)" : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        transition: "all 0.15s ease",
        opacity: isActive ? 1 : 0.6,
        transform: isActive ? "scale(1.05)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.opacity = "1"
          e.currentTarget.style.borderColor = "var(--border-gold)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.opacity = "0.6"
          e.currentTarget.style.borderColor = "var(--border-subtle)"
        }
      }}
    >
      {icon}
    </button>
  )
}
