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
  const { setDomain } = useChatStore()
  const { sendMessage } = useChat()
  const searchParams = useSearchParams()

  useEffect(() => {
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
    */
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left sidebar — sticky, full height */}
      <Sidebar />

      {/* Right side — header + chat + source panel */}
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
          <SourcePanel />
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
        height: "100vh",
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
