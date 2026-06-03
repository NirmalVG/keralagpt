<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md — KeralaGPT Frontend

> Next.js 16 · TypeScript · Tailwind CSS v4 · Zustand
> Read this fully before touching any file. No exceptions.

---

## 1. Project Identity

**KeralaGPT** is a Kerala cultural intelligence platform — a RAG-powered AI chat system for Kerala's heritage, performing arts, literature, cinema, and history. Codename: **Samskriti**.

This frontend is the user-facing layer. It proxies all AI calls to a FastAPI backend. It never holds API keys. It never calls Groq, Supabase, or nomic directly.

**Owner:** Weblyr AI  
**Stack:** Next.js 16, TypeScript (strict), Tailwind CSS v4, Zustand, React Server Components  
**Deployed on:** Vercel (free tier)

---

## 2. Absolute Rules

These are non-negotiable. Violating any of these is a hard failure.

```
DO NOT expose API keys to the browser. Ever.
DO NOT call the FastAPI backend directly from client components.
  → All backend calls go through Next.js API routes under /app/api/
DO NOT use `any` in TypeScript. Strict mode is on.
DO NOT use the `pages/` router. This project uses App Router only.
DO NOT use `useEffect` for data fetching. Use RSC, Server Actions, or React Query.
DO NOT write CSS in .css files. Use Tailwind utility classes and CSS variables in globals.css.
DO NOT use inline styles unless animating a dynamic value (e.g. width from state).
DO NOT add new npm packages without checking if a built-in or existing package solves it first.
DO NOT import from `react` for hooks available via React 19 (e.g. `use`, `useOptimistic`).
```

---

## 3. Tech Stack — Exact Versions & Why

| Technology   | Version          | Why It's Here                                     |
| ------------ | ---------------- | ------------------------------------------------- |
| Next.js      | 16 (App Router)  | RSC, streaming, server-side proxy for API keys    |
| TypeScript   | 5.x, strict mode | Type safety, PRD requirement                      |
| Tailwind CSS | v4               | Utility-first, design token support               |
| Zustand      | 5.x              | Lightweight global state (chat history, UI state) |
| React        | 19               | `use()`, `useOptimistic`, transitions             |

**Do not upgrade major versions without explicit approval.**

---

## 4. Folder Structure

```
frontend/
├── app/
│   ├── (chat)/
│   │   ├── page.tsx              ← Main chat interface (default route)
│   │   └── [domain]/
│   │       └── page.tsx          ← Domain-specific chat (e.g. /performing-arts)
│   ├── explore/
│   │   └── page.tsx              ← Domain explorer (8 domain cards)
│   ├── contribute/
│   │   └── page.tsx              ← Knowledge contribution form
│   ├── admin/
│   │   └── page.tsx              ← Admin panel (Supabase Auth protected)
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          ← SSE proxy to FastAPI /chat
│   │   ├── contribute/
│   │   │   └── route.ts          ← Proxy to FastAPI /contribute
│   │   ├── feedback/
│   │   │   └── route.ts          ← Proxy to FastAPI /feedback
│   │   └── health/
│   │       └── route.ts          ← Health check proxy
│   ├── globals.css               ← CSS variables (Kerala palette), base styles
│   ├── layout.tsx                ← Root layout, fonts, metadata
│   └── not-found.tsx
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx     ← Main chat shell (client component)
│   │   ├── MessageBubble.tsx     ← Single message rendering
│   │   ├── MessageList.tsx       ← Scrollable message thread
│   │   ├── QueryInput.tsx        ← Input bar with domain indicator
│   │   └── StreamingIndicator.tsx← Animated loading state
│   ├── knowledge/
│   │   ├── SourcePanel.tsx       ← Collapsible source attribution accordion
│   │   ├── SourceChip.tsx        ← Individual source badge
│   │   ├── ConfidenceBadge.tsx   ← High/Medium/Low confidence display
│   │   └── FollowUpSuggestions.tsx← 3 follow-up question buttons
│   ├── explore/
│   │   ├── DomainGrid.tsx        ← 4×2 domain card grid
│   │   └── DomainCard.tsx        ← Individual domain card with hover tilt
│   ├── contribute/
│   │   └── ContributionForm.tsx  ← Knowledge submission form
│   ├── ui/
│   │   ├── Button.tsx            ← Base button component
│   │   ├── Badge.tsx             ← Status/credibility badges
│   │   └── Spinner.tsx           ← Loading spinner
│   └── layout/
│       ├── Sidebar.tsx           ← Chat history + domain filter
│       ├── Header.tsx            ← Top bar with logo
│       └── MobileNav.tsx         ← Mobile navigation drawer
├── lib/
│   ├── store/
│   │   ├── chatStore.ts          ← Zustand: messages, streaming state, domain
│   │   └── uiStore.ts            ← Zustand: sidebar open, language toggle
│   ├── hooks/
│   │   ├── useChat.ts            ← Chat submit + SSE stream consumption
│   │   └── useLanguage.ts        ← Language detection/toggle
│   ├── types/
│   │   ├── chat.ts               ← Message, Source, FollowUp types
│   │   └── domain.ts             ← Domain, Chunk, Contribution types
│   └── utils/
│       ├── stream.ts             ← SSE stream parsing helpers
│       └── language.ts           ← Language detection utilities
├── public/
│   └── fonts/                    ← Self-hosted fonts if needed
└── tailwind.config.ts
```

---

## 5. Design System — Kerala Aesthetic

This is not a generic AI product. The visual language comes from Kerala's cultural identity: Theyyam face paint, brass temple lamps, monsoon forests. Every design decision must serve this identity.

### 5.1 Color Palette

Defined in `app/globals.css` as CSS variables. **Never hardcode these hex values in components — always use the variable.**

```css
:root {
  /* Backgrounds */
  --bg-primary: #0d0b08; /* Near-black, warm — page background */
  --bg-secondary: #141210; /* Card backgrounds */
  --bg-elevated: #1c1915; /* Hover states, active items */

  /* Kerala Accent System */
  --accent-gold: #c8952a; /* Temple gold — primary accent, CTAs */
  --accent-deep-red: #8b1a1a; /* Theyyam crimson — secondary, danger */
  --accent-kerala: #1b4d2e; /* Monsoon green — tertiary, success */
  --accent-brass: #b87333; /* Brass lamp — warm highlights */

  /* Text */
  --text-primary: #f0ebe1; /* Warm white — headings, primary text */
  --text-secondary: #a89880; /* Muted warm — body, captions */
  --text-muted: #6b5c4d; /* Very muted — placeholders, timestamps */

  /* Source Credibility Colors */
  --source-official: #c8952a; /* Gold — official publications */
  --source-academic: #7b9fbe; /* Blue — academic papers */
  --source-curated: #8fbf8f; /* Green — Weblyr curated content */
  --source-community: #bf8fbf; /* Purple — community contributions */
}
```

### 5.2 Typography

```css
/* In globals.css — import from Google Fonts in layout.tsx */

--font-display: "Yatra One", cursive; /* Brand/logo only */
--font-heading: "DM Serif Display", serif; /* H1, H2, section titles */
--font-body: "Source Serif 4", serif; /* Body text, messages */
--font-mono: "JetBrains Mono", monospace; /* Source citations, metadata */
--font-malayalam: "Noto Sans Malayalam", sans-serif; /* All Malayalam text */
```

**Usage rules:**

- Headings → `font-heading`
- AI response text → `font-body`
- Source attribution, timestamps, metadata → `font-mono`
- Any Malayalam-language content → `font-malayalam`
- Never use Inter, Roboto, or system fonts in UI-facing text

### 5.3 Tailwind Token Mapping

Extend `tailwind.config.ts` to reference CSS variables:

```ts
theme: {
  extend: {
    colors: {
      'bg-primary': 'var(--bg-primary)',
      'bg-secondary': 'var(--bg-secondary)',
      'accent-gold': 'var(--accent-gold)',
      'accent-red': 'var(--accent-deep-red)',
      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-muted': 'var(--text-muted)',
    },
    fontFamily: {
      heading: 'var(--font-heading)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
      malayalam: 'var(--font-malayalam)',
    },
  },
}
```

---

## 6. Component Conventions

### 6.1 Server vs Client Components

```
DEFAULT TO SERVER COMPONENTS.
Add 'use client' only when you need:
  - useState / useReducer
  - useEffect
  - Browser APIs (window, document, localStorage)
  - Event handlers (onClick, onChange, onSubmit)
  - Zustand store access
  - SSE stream consumption
```

**Pattern — Keep client boundaries as deep as possible:**

```tsx
// ✅ CORRECT — Only the interactive part is a client component
// app/(chat)/page.tsx  — SERVER component
export default async function ChatPage() {
  const domains = await getDomains(); // server-side fetch
  return (
    <main>
      <ChatInterface domains={domains} /> {/* client component */}
    </main>
  );
}

// components/chat/ChatInterface.tsx — CLIENT component
'use client';
export function ChatInterface({ domains }) { ... }
```

### 6.2 Naming Conventions

| Item           | Convention                    | Example                 |
| -------------- | ----------------------------- | ----------------------- |
| Components     | PascalCase                    | `MessageBubble.tsx`     |
| Hooks          | camelCase with `use` prefix   | `useChat.ts`            |
| Utilities      | camelCase                     | `parseStream.ts`        |
| Types          | PascalCase                    | `type ChatMessage`      |
| Zustand stores | camelCase with `Store` suffix | `chatStore.ts`          |
| API routes     | kebab-case directories        | `app/api/chat/route.ts` |
| CSS variables  | kebab-case with `--` prefix   | `--accent-gold`         |

### 6.3 TypeScript — Types Over Interfaces for Data, Interfaces for Contracts

```ts
// lib/types/chat.ts

// Data shapes → type
export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  followUps?: string[]
  confidence?: "high" | "medium" | "low"
  domain?: Domain
  createdAt: Date
  isStreaming?: boolean
}

export type Source = {
  title: string
  author?: string
  year?: number
  section?: string
  credibilityTier: "official" | "academic" | "curated" | "community"
  retrievedPassage?: string
}

// Contracts (props, function signatures) → interface
export interface ChatInterfaceProps {
  domains: Domain[]
  initialMessages?: ChatMessage[]
}
```

### 6.4 Component Template

```tsx
// components/chat/MessageBubble.tsx
import type { ChatMessage } from "@/lib/types/chat"
import { SourcePanel } from "@/components/knowledge/SourcePanel"
import { ConfidenceBadge } from "@/components/knowledge/ConfidenceBadge"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
          max-w-[75%] rounded-lg px-4 py-3
          ${
            isUser
              ? "bg-bg-elevated text-text-primary"
              : "bg-bg-secondary text-text-primary font-body"
          }
        `}
      >
        <p>{message.content}</p>
        {!isUser && message.sources && (
          <SourcePanel sources={message.sources} />
        )}
        {!isUser && message.confidence && (
          <ConfidenceBadge level={message.confidence} />
        )}
      </div>
    </div>
  )
}
```

---

## 7. State Management — Zustand

All global state lives in `lib/store/`. Local UI state (open/closed dropdowns, input values) stays in `useState`.

### 7.1 Chat Store

```ts
// lib/store/chatStore.ts
import { create } from "zustand"
import type { ChatMessage, Domain } from "@/lib/types/chat"

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  activeDomain: Domain | null
  sessionId: string

  addMessage: (message: ChatMessage) => void
  updateLastMessage: (content: string) => void // for streaming token append
  setStreaming: (value: boolean) => void
  setDomain: (domain: Domain | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  activeDomain: null,
  sessionId: crypto.randomUUID(),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last?.role === "assistant") {
        messages[messages.length - 1] = { ...last, content }
      }
      return { messages }
    }),

  setStreaming: (value) => set({ isStreaming: value }),
  setDomain: (domain) => set({ activeDomain: domain }),
  clearMessages: () => set({ messages: [] }),
}))
```

**Rule:** Never put server data (documents, domains list) in Zustand. That belongs in RSC props or React Query. Zustand is only for: in-flight chat state, UI preferences, session-scoped data.

---

## 8. API Communication — Streaming Pattern

This is the most important pattern in the frontend. Understand it completely.

```
Browser → POST /api/chat (Next.js API route)
            → Next.js server fetches FastAPI /chat
               → FastAPI streams SSE tokens
            ← Next.js passes the stream body through
         ← Browser reads SSE tokens and appends to message
```

### 8.1 The API Route (Server Side)

```ts
// app/api/chat/route.ts
export async function POST(req: Request) {
  const body = await req.json()

  const upstream = await fetch(`${process.env.FASTAPI_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    return new Response("Backend error", { status: upstream.status })
  }

  // Pass FastAPI's SSE stream straight through to the browser
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
```

### 8.2 The Client Hook

```ts
// lib/hooks/useChat.ts
"use client"
import { useChatStore } from "@/lib/store/chatStore"
import type { ChatMessage } from "@/lib/types/chat"

export function useChat() {
  const { addMessage, updateLastMessage, setStreaming } = useChatStore()

  const sendMessage = async (query: string, domain?: string) => {
    // 1. Add the user message immediately
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date(),
    }
    addMessage(userMsg)

    // 2. Add a blank assistant message — will be filled by stream
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isStreaming: true,
      createdAt: new Date(),
    }
    addMessage(assistantMsg)
    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, domain }),
      })

      if (!res.body) throw new Error("No response body")

      // 3. Read the SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // SSE format: "data: <token>\n\n"
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            accumulated += line.slice(6)
            updateLastMessage(accumulated)
          }
        }
      }
    } finally {
      setStreaming(false)
    }
  }

  return { sendMessage }
}
```

---

## 9. The 8 Knowledge Domains

These are the exact domain slugs. Use them consistently in routing, API calls, and type definitions.

```ts
// lib/types/domain.ts
export const DOMAINS = [
  { id: "performing-arts", label: "Performing Arts", labelMl: "പ്രകടന കലകൾ" },
  {
    id: "literature",
    label: "Classical Literature",
    labelMl: "ക്ലാസിക്കൽ സാഹിത്യം",
  },
  { id: "history", label: "History & Heritage", labelMl: "ചരിത്രം & പൈതൃകം" },
  {
    id: "temple-arch",
    label: "Temple Architecture",
    labelMl: "ക്ഷേത്ര വാസ്തുവിദ്യ",
  },
  {
    id: "festivals",
    label: "Festivals & Rituals",
    labelMl: "ഉത്സവങ്ങൾ & ആചാരങ്ങൾ",
  },
  { id: "cuisine", label: "Cuisine", labelMl: "പാചകരീതി" },
  { id: "cinema", label: "Malayalam Cinema", labelMl: "മലയാള സിനിമ" },
  {
    id: "geography",
    label: "Geography & Nature",
    labelMl: "ഭൂമിശാസ്ത്രം & പ്രകൃതി",
  },
] as const

export type DomainId = (typeof DOMAINS)[number]["id"]
```

---

## 10. Malayalam Language Handling

- Auto-detect query language using the `langdetect` signal from the backend response
- Malayalam text **must** use `font-malayalam` class and `lang="ml"` attribute
- All Unicode rendering tested against Chrome + Firefox on Android (primary Malayalam user devices)

```tsx
// Always wrap Malayalam text with lang attribute
<span lang="ml" className="font-malayalam text-text-primary">
  {message.content}
</span>
```

---

## 11. Environment Variables

All secrets live in `.env.local` (never committed). Frontend env vars that are safe for server-side code only (not prefixed `NEXT_PUBLIC_`) are used in API routes.

```bash
# .env.local
FASTAPI_URL=http://localhost:8000     # Backend URL — server-side only
NEXT_PUBLIC_APP_NAME=KeralaGPT        # Safe for client — no secret
```

**Rule:** If a variable doesn't need to be in the browser, don't prefix it with `NEXT_PUBLIC_`. Default to server-only.

---

## 12. Performance Rules

| Rule                                              | Reason                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| Images via `next/image` only                      | Automatic WebP, lazy loading, size optimization |
| Malayalam fonts subset to required Unicode ranges | Full Noto Sans Malayalam is 2MB+                |
| Streaming responses, never await full response    | PRD target: first token < 1.5s                  |
| Domain pages use `generateStaticParams`           | Pre-render the 8 domain routes at build time    |
| Chat history virtualized if > 50 messages         | Prevent DOM bloat in long sessions              |

---

## 13. Accessibility

- All interactive elements keyboard-navigable
- Malayalam content has `lang="ml"` — screen readers switch voice correctly
- Minimum contrast: `--text-secondary` on `--bg-secondary` must pass 4.5:1
- `aria-live="polite"` on the streaming message container — screen readers announce new tokens
- Domain cards have `aria-label` in both English and Malayalam

---

## 14. What This Frontend Does NOT Do

```
Does NOT call Groq, Supabase, or nomic directly
Does NOT manage user accounts (Supabase Auth is backend-only in v1)
Does NOT store chat history to a database (session-only, in Zustand)
Does NOT render video or audio
Does NOT implement the RAG pipeline
Does NOT generate embeddings
```

---

## 15. Key Files Quick Reference

| File                     | Purpose                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `app/globals.css`        | Kerala design token definitions — the single source of truth for colors, fonts |
| `app/layout.tsx`         | Font loading, root metadata, global providers                                  |
| `app/api/chat/route.ts`  | The SSE proxy — most critical API route                                        |
| `lib/store/chatStore.ts` | Global chat state — messages, streaming status                                 |
| `lib/hooks/useChat.ts`   | The hook that sends queries and reads the stream                               |
| `lib/types/chat.ts`      | All shared TypeScript types                                                    |
| `tailwind.config.ts`     | Design token mapping — connects CSS vars to Tailwind classes                   |
| `.env.local`             | Secrets — never committed, never read by client components                     |

---

_Maintained by Weblyr AI. Part of the KeralaGPT build._

<!-- END:nextjs-agent-rules -->
