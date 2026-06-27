"use client"
// components/layout/Header.tsx
import { useEffect, useState } from "react"
import { useChatStore } from "@/lib/store/chatStore"
import Image from "next/image"

export function Header() {
  const { isDark, toggleTheme, toggleSidebar, toggleSourcePanel } = useChatStore()
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
        ? "Checking..."
        : "Backend offline"

  return (
    <header
      style={{
        height: "var(--header-height)",
        borderBottom: "1px solid var(--border-subtle)",
        background: isDark
          ? "rgba(12, 9, 14, 0.85)"
          : "rgba(247, 242, 234, 0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.6s ease",
        gap: 8,
      }}
    >
      {/* ── Left: Hamburger + Logo ──────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
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
            fontSize: 16,
            color: "var(--text-secondary)",
            transition: "all 0.15s ease",
            flexShrink: 0,
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
          ☰
        </button>

        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/logo-lotus.svg"
            alt="KeralaGPT"
            width={28}
            height={24}
            priority
          />
          <span
            className="header-logo"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: "var(--gold-dark)",
              letterSpacing: "-0.02em",
            }}
          >
            KeralaGPT
          </span>
        </a>
      </div>

      {/* ── Center: Nav Links ────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { label: "Chat", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: "Contribute", href: "/contribute" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="header-nav-label"
            style={{
              padding: "6px 14px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              fontWeight: 400,
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: 6,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--gold-dark)"
              e.currentTarget.style.background = "var(--bg-elevated)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ── Right Controls ────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {/* Status pill */}
        <div
          title={statusLabel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 8px",
            borderRadius: 100,
            border: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-ui)",
            fontSize: 11,
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: statusColor,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span className="header-status-label">{statusLabel}</span>
        </div>

        {/* Source panel toggle */}
        <button
          onClick={toggleSourcePanel}
          aria-label="Toggle source panel"
          title="Toggle sources"
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
            flexShrink: 0,
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
          📚
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          style={{
            width: 52,
            height: 26,
            borderRadius: 100,
            border: `1.5px solid ${isDark ? "rgba(139,92,246,0.35)" : "rgba(200,149,42,0.35)"}`,
            background: isDark ? "#1C1820" : "#F5F0E8",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: isDark ? 27 : 2,
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
      </div>
    </header>
  )
}
