"use client"
// app/page.tsx
// Client Component — assembles the three-panel layout
// Handles URL params: ?domain=performing-arts&q=What+is+Theyyam

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { SourcePanel } from "@/components/knowledge/SourcePanel"
import { useChatStore } from "@/lib/store/chatStore"
import { useChat } from "@/lib/hooks/useChat"
import { DOMAINS } from "@/lib/types/chat"

function HomePageInner() {
  const {
    setDomain,
    sidebarOpen,
    setSidebarOpen,
    sourcePanelOpen,
    setSourcePanelOpen,
  } = useChatStore()
  const { sendMessage } = useChat()
  const searchParams = useSearchParams()

  // On mount: close sidebar on mobile/tablet, handle URL params
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false)
      setSourcePanelOpen(false)
    }

    const domainParam = searchParams.get("domain")
    const queryParam = searchParams.get("q")

    if (domainParam) {
      const domain = DOMAINS.find((d) => d.id === domainParam)
      if (domain) {
        setDomain(domain)
      }
    }

    if (queryParam) {
      // Small delay to ensure the store is ready
      const timer = setTimeout(() => {
        sendMessage(queryParam)
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    /*
      Three-column layout:
      [Sidebar 268px] [Main flex-1] [SourcePanel 300px]

      The header sits above the main + source panel columns.
      Sidebar has its own sticky positioning.
      Desktop: wrapper div animates width for collapse/expand.
      Mobile:  sidebar is fixed-positioned drawer; wrapper is 0px.
    */
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* ── Left sidebar — desktop wrapper handles collapse ──── */}
      <div
        className="sidebar-desktop-wrapper"
        style={{
          width: sidebarOpen ? "var(--sidebar-width)" : "0px",
          minWidth: sidebarOpen ? "var(--sidebar-width)" : "0px",
        }}
      >
        <Sidebar />
      </div>

      {/* ── Right side — header + chat + source panel ─────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Header spans main + source panel */}
        <Header />

        {/* Content row */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <ChatInterface />

          {/* ── Right source panel — desktop wrapper ────── */}
          <div
            className="source-desktop-wrapper"
            style={{
              width: sourcePanelOpen ? "var(--source-width)" : "0px",
              minWidth: sourcePanelOpen ? "var(--source-width)" : "0px",
            }}
          >
            <SourcePanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageInner />
    </Suspense>
  )
}

function PageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: "var(--bg-page)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          color: "var(--gold-dark)",
          animation: "fade-in 0.4s ease-out",
        }}
      >
        KeralaGPT
      </div>
    </div>
  )
}
