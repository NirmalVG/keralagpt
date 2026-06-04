"use client"
// components/chat/HeroGreeting.tsx
import { useChat } from "@/lib/hooks/useChat"
import { useChatStore } from "@/lib/store/chatStore"

const SUGGESTIONS = [
  {
    icon: "🎭",
    title: "What is Theyyam?",
    sub: "Explore the ancient ritual art form of North Kerala.",
  },
  {
    icon: "💃",
    title: "History of Kathakali",
    sub: "The evolution of classical dance-drama.",
  },
  {
    icon: "⛵",
    title: "Muziris Port",
    sub: "The legendary ancient spice trade hub.",
  },
  {
    icon: "🏛️",
    title: "Temple Architecture",
    sub: "Unique wood and stone structures of the region.",
  },
  {
    icon: "🌿",
    title: "Ayurvedic Traditions",
    sub: "Ancient wellness systems and medicinal plants.",
  },
  {
    icon: "🍛",
    title: "Culinary Heritage",
    sub: "The role of spices in traditional Kerala cuisine.",
  },
]

export function HeroGreeting() {
  const { sendMessage } = useChat()
  const { isStreaming } = useChatStore()

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        overflowY: "auto",
        animation: "fade-up 0.4s ease-out",
      }}
    >
      {/* Logo icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 16,
          background: "var(--bg-card)",
          border: "1px solid var(--border-gold)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          marginBottom: 24,
        }}
      >
        ◉
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 52,
          fontWeight: 400,
          color: "var(--crimson)",
          letterSpacing: "-0.02em",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Samskriti
      </h1>

      {/* Headline */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 400,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom: 8,
          textAlign: "center",
          maxWidth: 520,
        }}
      >
        What would you like to know about Kerala?
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          color: "var(--text-muted)",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        3,000 years of culture, arts, history, and wisdom await your
        exploration.
      </p>

      {/* ── Suggestion Cards ────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => !isStreaming && sendMessage(s.title)}
            disabled={isStreaming}
            style={{
              padding: "14px 16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              cursor: isStreaming ? "not-allowed" : "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              opacity: isStreaming ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isStreaming) {
                e.currentTarget.style.borderColor = "var(--border-gold)"
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
                e.currentTarget.style.transform = "translateY(-1px)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)"
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--gold-dark)",
                }}
              >
                {s.title}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-muted)",
                lineHeight: 1.4,
                marginLeft: 23,
              }}
            >
              {s.sub}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
