"use client"

import { useEffect, useState } from "react"
import type { Contribution, RetrievalStats } from "@/lib/types/chat"

const ADMIN_PASSWORD = "keralagpt-admin-2026"

type Tab = "contributions" | "feedback" | "stats"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("contributions")

  useEffect(() => {
    const saved = sessionStorage.getItem("keralagpt-admin-auth")
    if (saved === "true") setAuthenticated(true)
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem("keralagpt-admin-auth", "true")
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-page)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: "48px 40px",
            width: "min(400px, 90vw)",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--gold-light), var(--gold-mid))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 20px",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Admin Panel
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Enter the admin password to continue.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: error
                ? "1.5px solid var(--crimson)"
                : "1.5px solid var(--border-default)",
              background: "var(--bg-elevated)",
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              color: "var(--text-primary)",
              outline: "none",
              marginBottom: 12,
            }}
          />
          {error && (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                color: "var(--crimson)",
                marginBottom: 12,
              }}
            >
              Invalid password
            </p>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: "var(--gold-dark)",
              color: "#FAF7F2",
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px clamp(16px, 4vw, 40px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--gold-dark)",
            textDecoration: "none",
          }}
        >
          KeralaGPT
        </a>
        <span
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Admin Panel
        </span>
      </nav>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "20px 40px 0",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {(
          [
            { key: "contributions", label: "📝 Contributions" },
            { key: "feedback", label: "📊 Feedback" },
            { key: "stats", label: "🗂️ Knowledge Base" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--gold-light)"
                  : "2px solid transparent",
              background: "transparent",
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color:
                activeTab === tab.key
                  ? "var(--gold-dark)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px clamp(16px, 4vw, 40px) 80px", maxWidth: 1000 }}>
        {activeTab === "contributions" && <ContributionsTab />}
        {activeTab === "feedback" && <FeedbackTab />}
        {activeTab === "stats" && <StatsTab />}
      </div>
    </div>
  )
}

/* ── Contributions Tab ─────────────────────────────────────────── */
function ContributionsTab() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("pending")

  useEffect(() => {
    fetchContributions()
  }, [filter])

  async function fetchContributions() {
    setLoading(true)
    try {
      const res = await fetch(`/api/contribute?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setContributions(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: string, status: "approved" | "rejected") {
    try {
      await fetch(`/api/contribute/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchContributions()
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              border:
                filter === s
                  ? "1.5px solid var(--gold-light)"
                  : "1px solid var(--border-default)",
              background: filter === s ? "var(--gold-subtle)" : "transparent",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              fontWeight: filter === s ? 500 : 400,
              color:
                filter === s ? "var(--gold-dark)" : "var(--text-secondary)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)" }}>
          Loading...
        </p>
      ) : contributions.length === 0 ? (
        <p style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)" }}>
          No {filter} contributions.
        </p>
      ) : (
        contributions.map((c) => (
          <div
            key={c.id}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {c.title}
              </h3>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 100,
                  fontFamily: "var(--font-ui)",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  background:
                    c.status === "approved"
                      ? "rgba(26,107,60,0.12)"
                      : c.status === "rejected"
                        ? "rgba(139,32,16,0.12)"
                        : "var(--gold-subtle)",
                  color:
                    c.status === "approved"
                      ? "var(--jade)"
                      : c.status === "rejected"
                        ? "var(--crimson)"
                        : "var(--gold-dark)",
                }}
              >
                {c.status}
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 8,
                display: "flex",
                gap: 12,
              }}
            >
              <span>Domain: {c.domain}</span>
              {c.contributor_name && (
                <span>By: {c.contributor_name}</span>
              )}
              <span>
                {new Date(c.submitted_at).toLocaleDateString()}
              </span>
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: 12,
                maxHeight: 120,
                overflow: "hidden",
              }}
            >
              {c.content}
            </p>

            {c.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleReview(c.id, "approved")}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--jade)",
                    color: "#fff",
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReview(c.id, "rejected")}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 6,
                    border: "1px solid var(--crimson)",
                    background: "transparent",
                    color: "var(--crimson)",
                    fontFamily: "var(--font-ui)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ── Feedback Tab ──────────────────────────────────────────────── */
function FeedbackTab() {
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, reports: 0 })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/feedback")
        if (res.ok) setStats(await res.json())
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const metrics = [
    { label: "Total Feedback", value: stats.total, color: "var(--gold-dark)" },
    { label: "Positive (👍)", value: stats.positive, color: "var(--jade)" },
    { label: "Negative (👎)", value: stats.negative, color: "var(--crimson)" },
    { label: "Inaccuracy Reports", value: stats.reports, color: "var(--sapphire)" },
  ]

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                color: m.color,
                marginBottom: 4,
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {stats.total > 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 12,
            }}
          >
            Satisfaction Rate
          </h3>
          <div
            style={{
              height: 8,
              borderRadius: 100,
              background: "var(--border-subtle)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${stats.total > 0 ? (stats.positive / stats.total) * 100 : 0}%`,
                height: "100%",
                borderRadius: 100,
                background: "linear-gradient(90deg, var(--jade), var(--gold-light))",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            {stats.total > 0
              ? `${Math.round((stats.positive / stats.total) * 100)}% positive`
              : "No feedback yet"}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Stats Tab ─────────────────────────────────────────────────── */
function StatsTab() {
  const [stats, setStats] = useState<RetrievalStats | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/retrieval/stats")
        if (res.ok) setStats(await res.json())
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  if (!stats) {
    return (
      <p style={{ fontFamily: "var(--font-ui)", color: "var(--text-muted)" }}>
        Loading stats...
      </p>
    )
  }

  const domainEntries = Object.entries(stats.documents_by_domain || {})
  const maxCount = Math.max(...domainEntries.map(([, c]) => c), 1)

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Total Documents", value: stats.total_documents },
          { label: "Total Chunks", value: stats.total_chunks },
          { label: "Domains Seeded", value: domainEntries.length },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 36,
                color: "var(--gold-dark)",
                marginBottom: 4,
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        Documents by Domain
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {domainEntries.map(([domain, count]) => (
          <div key={domain}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontFamily: "var(--font-ui)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>{domain}</span>
              <span style={{ color: "var(--text-muted)" }}>
                {count} docs
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 100,
                background: "var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  height: "100%",
                  borderRadius: 100,
                  background:
                    "linear-gradient(90deg, var(--gold-light), var(--gold-mid))",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}

        {domainEntries.length === 0 && (
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            No documents ingested yet.
          </p>
        )}
      </div>
    </div>
  )
}
