"use client"
// components/layout/Sidebar.tsx
import { useChatStore } from "@/lib/store/chatStore"

// Local fallback for domains (was imported from @/lib/constants)
const DOMAINS = [
  { id: "history", label: "History", labelMl: "ചരിത്രം", icon: "📜" },
  { id: "culture", label: "Culture", labelMl: "സংസ്കാരം", icon: "🕉️" },
  { id: "trade", label: "Trade", labelMl: "വാണിജ്യം", icon: "⚓" },
]

const RECENT_THREADS = [
  { id: "1", query: "Mural pigments of Padmanabha...", color: "#C8952A" },
  { id: "2", query: "Evolution of Mohiniyattam", color: "#8B2010" },
  { id: "3", query: "Spice trade routes of Malabar", color: "#1A6B3C" },
]

export function Sidebar() {
  const { activeDomain, setDomain, clearMessages } = useChatStore()

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minWidth: "var(--sidebar-width)",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div style={{ padding: "20px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {/* Logo icon — amber square with symbol */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #C8952A, #E8A020)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-gold)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16 }}>⊚</span>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Terminal v1.0
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 500,
                fontSize: 9,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Ancient Futurism Engine
            </div>
          </div>
        </div>

        {/* New Insight button */}
        <button
          onClick={clearMessages}
          style={{
            width: "100%",
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "var(--gold-dark)",
            color: "#FAF7F2",
            fontFamily: "var(--font-ui)",
            fontWeight: 500,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--gold-mid)"
            e.currentTarget.style.transform = "translateY(-1px)"
            e.currentTarget.style.boxShadow = "var(--shadow-gold)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--gold-dark)"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          New Insight
        </button>
      </div>

      {/* ── Active Domains ────────────────────────────── */}
      <div style={{ padding: "8px 0" }}>
        <div
          style={{
            padding: "0 16px 8px",
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Active Domains
        </div>

        {DOMAINS.map((domain) => {
          const isActive = activeDomain?.id === domain.id
          return (
            <button
              key={domain.id}
              onClick={() => setDomain(isActive ? null : domain)}
              style={{
                width: "100%",
                padding: "9px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "none",
                borderLeft: isActive
                  ? "3px solid var(--gold-light)"
                  : "3px solid transparent",
                background: isActive
                  ? "var(--bg-domain-active)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "rgba(107,68,16,0.06)"
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent"
              }}
            >
              <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.7 }}>
                {domain.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive
                    ? "var(--gold-dark)"
                    : "var(--text-secondary)",
                }}
              >
                {domain.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Recent Threads ────────────────────────────── */}
      <div
        style={{
          padding: "16px 0 8px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: 8,
        }}
      >
        <div
          style={{
            padding: "0 16px 8px",
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Recent Threads
        </div>

        {RECENT_THREADS.map((thread) => (
          <button
            key={thread.id}
            style={{
              width: "100%",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(107,68,16,0.06)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            {/* Colored dot */}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: thread.color,
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {thread.query}
            </span>
          </button>
        ))}
      </div>

      {/* ── Spacer ────────────────────────────────────── */}
      <div style={{ flex: 1 }} />

      {/* ── Knowledge Base Stats ──────────────────────── */}
      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            padding: "12px 14px",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            <span>📚</span> Knowledge Base Stats
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              borderRadius: 100,
              background: "var(--border-subtle)",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: "87%",
                height: "100%",
                borderRadius: 100,
                background:
                  "linear-gradient(90deg, var(--gold-light), var(--gold-mid))",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            <span>Index Synchronized</span>
            <span>87% Coverage</span>
          </div>
        </div>
      </div>

      {/* ── Bottom links ──────────────────────────────── */}
      <div
        style={{
          padding: "4px 0 16px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {[
          { icon: "📖", label: "Documentation" },
          { icon: "💬", label: "Support" },
        ].map((item) => (
          <button
            key={item.label}
            style={{
              width: "100%",
              padding: "9px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(107,68,16,0.06)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
            }}
          >
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
