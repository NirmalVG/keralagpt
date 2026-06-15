"use client"

import { useEffect, useState } from "react"
import { useChatStore } from "@/lib/store/chatStore"
import { DOMAINS, type RetrievalStats } from "@/lib/types/chat"

const RECENT_THREADS = [
  { id: "1", query: "Mural pigments of Padmanabha...", color: "#C8952A" },
  { id: "2", query: "Evolution of Mohiniyattam", color: "#8B2010" },
  { id: "3", query: "Spice trade routes of Malabar", color: "#1A6B3C" },
]

export function Sidebar() {
  const { activeDomain, setDomain, clearMessages } = useChatStore()
  const [stats, setStats] = useState<RetrievalStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const res = await fetch("/api/retrieval/stats")
        const data: RetrievalStats = await res.json()
        if (cancelled) return
        setStats(data)
        setStatsError(res.ok ? null : data.message ?? "Backend unavailable")
      } catch (error) {
        if (cancelled) return
        setStatsError(error instanceof Error ? error.message : "Backend unavailable")
      }
    }

    loadStats()
    const timer = window.setInterval(loadStats, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const totalDocs = stats?.total_documents ?? 0
  const totalChunks = stats?.total_chunks ?? 0
  const seededDomains = stats?.documents_by_domain
    ? Object.keys(stats.documents_by_domain).length
    : 0
  const coverage = Math.round((seededDomains / DOMAINS.length) * 100)
  const statsLabel = statsError
    ? "Backend unavailable"
    : totalDocs > 0
      ? `${totalDocs} docs / ${totalChunks} chunks`
      : "Knowledge base empty"

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
      <div style={{ padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
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
              color: "#FAF7F2",
              fontFamily: "var(--font-ui)",
              fontWeight: 700,
            }}
          >
            K
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              KeralaGPT
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
              Cultural Intelligence
            </div>
          </div>
        </div>

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
          }}
        >
          + New Insight
        </button>
      </div>

      <div style={{ padding: "8px 0" }}>
        <SectionLabel>Active Domains</SectionLabel>
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
                background: isActive ? "var(--bg-domain-active)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 24,
                  fontFamily: "var(--font-ui)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: isActive ? "var(--gold-dark)" : "var(--text-muted)",
                }}
              >
                {domain.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--gold-dark)" : "var(--text-secondary)",
                }}
              >
                {domain.label}
              </span>
            </button>
          )
        })}
      </div>

      <div
        style={{
          padding: "16px 0 8px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: 8,
        }}
      >
        <SectionLabel>Recent Threads</SectionLabel>
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
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: thread.color,
                flexShrink: 0,
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

      <div style={{ flex: 1 }} />

      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
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
            <span>KB</span> Knowledge Base Stats
          </div>
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
                width: `${coverage}%`,
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
              gap: 8,
              fontFamily: "var(--font-ui)",
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            <span>{statsLabel}</span>
            <span>{coverage}% Coverage</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  )
}
