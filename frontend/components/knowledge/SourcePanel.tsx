"use client"
// components/knowledge/SourcePanel.tsx
import { useChatStore } from "@/lib/store/chatStore"
import type { Source } from "@/lib/types/chat"

const TIER_CONFIG = {
  official: { label: "Official", bg: "#C8952A", text: "#FFFFFF" },
  academic: { label: "Academic", bg: "#1A4A7A", text: "#FFFFFF" },
  curated: { label: "Curated", bg: "#1A6B3C", text: "#FFFFFF" },
  community: { label: "Community", bg: "#6B2D8B", text: "#FFFFFF" },
  web: { label: "Web", bg: "#7C3AED", text: "#FFFFFF" },
}

export function SourcePanel() {
  const { messages, sourcePanelOpen, setSourcePanelOpen } = useChatStore()

  // Get sources from the last assistant message
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")
  const sources = lastAssistant?.sources ?? []
  const hasSources = sources.length > 0

  return (
    <>
      {/* ── Backdrop overlay (mobile/tablet) ──── */}
      <div
        className={`source-backdrop ${sourcePanelOpen ? "source-backdrop-visible" : ""}`}
        onClick={() => setSourcePanelOpen(false)}
      />

      <aside
        className={`source-panel-mobile ${sourcePanelOpen ? "source-panel-open" : ""}`}
        style={{
          width: "var(--source-width)",
          minWidth: "var(--source-width)",
          borderLeft: "1px solid var(--border-subtle)",
          background: "var(--bg-card)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
          animation: hasSources ? "slide-right 0.3s ease-out" : "none",
        }}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div
          style={{
            padding: "20px 18px 14px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Green pulse dot */}
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#1A6B3C",
                display: "inline-block",
                animation: hasSources ? "pulse-dot 2s ease infinite" : "none",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
              }}
            >
              Active Sources
            </span>
          </div>

          {/* Source count badge */}
          {hasSources && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 100,
                background: "var(--gold-subtle)",
                border: "1px solid var(--border-gold)",
                fontFamily: "var(--font-ui)",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--gold-dark)",
              }}
            >
              {sources.length} source{sources.length !== 1 ? "s" : ""}
            </span>
          )}

          {/* Close button */}
          <button
            onClick={() => setSourcePanelOpen(false)}
            aria-label="Close source panel"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid var(--border-subtle)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "var(--text-muted)",
              transition: "all 0.15s ease",
              flexShrink: 0,
              marginLeft: "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)"
              e.currentTarget.style.color = "var(--text-secondary)"
              e.currentTarget.style.borderColor = "var(--border-gold)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--text-muted)"
              e.currentTarget.style.borderColor = "var(--border-subtle)"
            }}
          >
            ×
          </button>
        </div>

        {/* ── Source Cards ────────────────────────────── */}
        <div style={{ padding: "12px 14px", flex: 1 }}>
          {!hasSources ? (
            <EmptySourceState />
          ) : (
            sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i + 1} />
            ))
          )}
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Citations auto-generated via
          <br />
          Semantic Search
        </div>
      </aside>
    </>
  )
}

/* ── Individual source card ─────────────────────────────────── */
function SourceCard({ source, index }: { source: Source; index: number }) {
  const tier =
    TIER_CONFIG[source.credibility_tier as keyof typeof TIER_CONFIG] ??
    TIER_CONFIG.curated
  const simPercent = Math.round(source.similarity * 100)

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderLeft: "3px solid var(--gold-light)",
        borderRadius: 8,
        padding: "12px 12px",
        marginBottom: 10,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)"
        e.currentTarget.style.borderLeftColor = "var(--gold-mid)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.borderLeftColor = "var(--gold-light)"
      }}
    >
      {/* Top row: index + tier badge + similarity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {/* Source number */}
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: "var(--gold-subtle)",
            border: "1px solid var(--border-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-ui)",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--gold-dark)",
            flexShrink: 0,
          }}
        >
          {index}
        </span>

        {/* Credibility tier */}
        <span
          style={{
            padding: "1px 6px",
            borderRadius: 100,
            background: tier.bg,
            fontFamily: "var(--font-ui)",
            fontSize: 9,
            fontWeight: 600,
            color: tier.text,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {tier.label}
        </span>

        {/* Similarity */}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            color: "var(--text-muted)",
          }}
        >
          {simPercent}%
        </span>

        {/* External link icon */}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-muted)", fontSize: 10, lineHeight: 1 }}
          >
            ↗
          </a>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          color: "var(--text-primary)",
          lineHeight: 1.35,
          marginBottom: source.section ? 4 : 0,
        }}
      >
        {source.title}
      </div>

      {/* Section */}
      {source.section && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontStyle: "italic",
            color: "var(--text-muted)",
            marginBottom: 0,
          }}
        >
          {source.section}
        </div>
      )}
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptySourceState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        textAlign: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 28, opacity: 0.4 }}>🏛️</span>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.5,
        }}
      >
        Sources will appear here after you ask a question.
      </p>
    </div>
  )
}
