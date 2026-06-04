// app/page.tsx
// Server Component — assembles the three-panel layout
// Client interactivity lives inside child components

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { SourcePanel } from "@/components/knowledge/SourcePanel"

export default function HomePage() {
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
