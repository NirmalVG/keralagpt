"use client"
// components/layout/Header.tsx
import { useEffect, useState } from "react"
import { useChatStore } from "@/lib/store/chatStore"

const NAV_ITEMS = ["Heritage", "Language", "Tradition", "Geography"]

export function Header() {
  const { isDark, toggleTheme } = useChatStore()
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking")

  useEffect(() => {
    let cancelled = false

    async function checkHealth() {
      try {
        const res = await fetch("/api/health")
        const data = await res.json()
        if (!cancelled) setApiStatus(res.ok && data.status === "ok" ? "ok" : "error")
      } catch {
        if (!cancelled) setApiStatus("error")
      }
    }

    checkHealth()
    const timer = window.setInterval(checkHealth, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const statusColor =
    apiStatus === "ok"
      ? "var(--jade)"
      : apiStatus === "checking"
        ? "var(--gold-mid)"
        : "var(--crimson)"
  const statusLabel =
    apiStatus === "ok"
      ? "Backend online"
      : apiStatus === "checking"
        ? "Checking backend"
        : "Backend offline"

  return (
    <header
      style={{
        height: "var(--header-height)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(247, 242, 234, 0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.6s ease",
      }}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          color: "var(--gold-dark)",
          letterSpacing: "-0.02em",
          flexShrink: 0,
        }}
      >
        KeralaGPT
      </div>

      {/* ── Domain Nav ────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item}
            style={{
              padding: "6px 14px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              fontWeight: i === 0 ? 500 : 400,
              color: i === 0 ? "var(--gold-dark)" : "var(--text-secondary)",
              borderBottom:
                i === 0
                  ? "2px solid var(--gold-light)"
                  : "2px solid transparent",
              borderRadius: 0,
              paddingBottom: 4,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--gold-dark)"
            }}
            onMouseLeave={(e) => {
              if (i !== 0) e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* ── Right Controls ────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          title={statusLabel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 9px",
            borderRadius: 100,
            border: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: statusColor,
              display: "inline-block",
            }}
          />
          {statusLabel}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          style={{
            width: 56,
            height: 28,
            borderRadius: 100,
            border: `1.5px solid ${isDark ? "rgba(139,92,246,0.35)" : "rgba(200,149,42,0.35)"}`,
            background: isDark ? "#1C1820" : "#F5F0E8",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}
        >
          {/* Thumb */}
          <span
            style={{
              position: "absolute",
              top: 3,
              left: isDark ? 29 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: isDark
                ? "linear-gradient(135deg, #2D2535, #3D3048)"
                : "linear-gradient(135deg, #FFFFFF, #F5F0E8)",
              boxShadow: isDark
                ? "0 0 12px rgba(139,92,246,0.40), 0 2px 6px rgba(0,0,0,0.3)"
                : "0 2px 6px rgba(44,26,14,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              transition: "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {isDark ? "✦" : "☀"}
          </span>
        </button>

        {/* Settings */}
        <button
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--text-secondary)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card)"
            e.currentTarget.style.borderColor = "var(--border-gold)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "var(--border-subtle)"
          }}
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
