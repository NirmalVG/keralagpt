"use client"

import { useEffect, useState } from "react"
import { useChatStore } from "@/lib/store/chatStore"
import {
  DOMAINS,
  type RetrievalStats,
  type ConversationSummary,
} from "@/lib/types/chat"
import Image from "next/image"

export function Sidebar() {
  const {
    activeDomain,
    setDomain,
    clearMessages,
    sidebarOpen,
    setSidebarOpen,
    loadConversation,
  } = useChatStore()
  const [stats, setStats] = useState<RetrievalStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const res = await fetch("/api/retrieval/stats")
        const data: RetrievalStats = await res.json()
        if (cancelled) return
        setStats(data)
        setStatsError(res.ok ? null : (data.message ?? "Backend unavailable"))
      } catch (error) {
        if (cancelled) return
        setStatsError(
          error instanceof Error ? error.message : "Backend unavailable",
        )
      }
    }

    async function loadConversations() {
      try {
        const res = await fetch("/api/conversations")
        if (res.ok) {
          const data: ConversationSummary[] = await res.json()
          if (!cancelled) setConversations(data)
        }
      } catch {
        // Silently fail — conversations are non-critical
      }
    }

    loadStats()
    loadConversations()
    const timer = window.setInterval(() => {
      loadStats()
      loadConversations()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const handleDeleteThread = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(sessionId)
    try {
      await fetch(`/api/conversations/${sessionId}`, { method: "DELETE" })
      setConversations((prev) => prev.filter((c) => c.session_id !== sessionId))
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) setSidebarOpen(false)
  }

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

  const domainColors: Record<string, string> = {
    "performing-arts": "#C8952A",
    literature: "#1A4A7A",
    history: "#8B2010",
    "temple-arch": "#6B2D8B",
    festivals: "#1A6B3C",
    cuisine: "#B87333",
    cinema: "#7C3AED",
    geography: "#2D8B6B",
  }

  return (
    <>
      {/* ── Backdrop overlay (mobile/tablet) ──── */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "sidebar-backdrop-visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`sidebar-mobile ${sidebarOpen ? "sidebar-open" : ""}`}
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
          {/* ── Logo + Brand ────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Image
              src="/images/keralagpt-logo.png"
              alt="KeralaGPT"
              width={36}
              height={30}
              style={{ flexShrink: 0 }}
              priority
            />
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
            onClick={() => {
              clearMessages()
              handleNavClick()
            }}
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
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            + New Insight
          </button>
        </div>

        {/* ── Navigation Links ─────────────────────── */}
        <div
          style={{
            padding: "0 16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <NavLink
            href="/explore"
            icon="🧭"
            label="Explore Domains"
            onClick={handleNavClick}
          />
          <NavLink
            href="/contribute"
            icon="📝"
            label="Contribute Knowledge"
            onClick={handleNavClick}
          />
        </div>

        <div style={{ padding: "8px 0" }}>
          <SectionLabel>Active Domains</SectionLabel>
          {DOMAINS.map((domain) => {
            const isActive = activeDomain?.id === domain.id
            return (
              <button
                key={domain.id}
                onClick={() => {
                  setDomain(isActive ? null : domain)
                  handleNavClick()
                }}
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
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-elevated)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent"
                  }
                }}
              >
                <span
                  style={{
                    width: 24,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
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

        {/* ── Recent Threads ───────────────────────── */}
        <div
          style={{
            padding: "16px 0 8px",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 8,
          }}
        >
          <SectionLabel>Recent Threads</SectionLabel>
          {conversations.length === 0 ? (
            <div
              style={{
                padding: "8px 16px",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              No conversations yet
            </div>
          ) : (
            conversations.slice(0, 8).map((convo) => (
              <div
                key={convo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => {
                    loadConversation(convo.session_id, convo.domain)
                    handleNavClick()
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 36px 8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    minWidth: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-elevated)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        domainColors[convo.domain ?? ""] ?? "var(--gold-light)",
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
                    {convo.query.length > 35
                      ? convo.query.slice(0, 35) + "..."
                      : convo.query}
                  </span>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteThread(convo.session_id, e)}
                  disabled={deletingId === convo.session_id}
                  title="Delete thread"
                  style={{
                    position: "absolute",
                    right: 8,
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    opacity: 0.4,
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1"
                    e.currentTarget.style.color = "var(--crimson)"
                    e.currentTarget.style.background = "rgba(139, 32, 16, 0.08)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.4"
                    e.currentTarget.style.color = "var(--text-muted)"
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  {deletingId === convo.session_id ? "·" : "×"}
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* ── Knowledge Base Stats ──────────────── */}
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
                  transition: "width 0.6s ease",
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
    </>
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

function NavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: string
  label: string
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 8,
        textDecoration: "none",
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        color: "var(--text-secondary)",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-elevated)"
        e.currentTarget.style.color = "var(--gold-dark)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "var(--text-secondary)"
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </a>
  )
}
