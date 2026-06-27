"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { DomainInfo } from "@/lib/types/chat"

const FALLBACK_DOMAINS: DomainInfo[] = [
  { id: "performing-arts", label: "Performing Arts", label_ml: "പ്രകടന കലകൾ", icon: "🎭", description: "Kathakali, Theyyam, Mohiniyattam, Koodiyattam, and the classical dance-drama traditions that define Kerala's artistic identity.", suggested_questions: ["What is Theyyam?", "History of Kathakali", "UNESCO and Koodiyattam"], article_count: 0 },
  { id: "literature", label: "Classical Literature", label_ml: "ക്ലാസിക്കൽ സാഹിത്യം", icon: "📚", description: "From Ramacharitam to modern masters — the literary heritage that shaped Malayalam as a language of profound expression.", suggested_questions: ["Who wrote Ramacharitam?", "What is Manipravalam?", "Malayalam literary eras"], article_count: 0 },
  { id: "history", label: "History & Heritage", label_ml: "ചരിത്രം & പൈതൃകം", icon: "🏛️", description: "Ancient kingdoms, spice trade empires, colonial encounters, and the modern formation of Kerala state.", suggested_questions: ["Zamorin dynasty history", "Formation of Kerala state", "Vasco da Gama in Kerala"], article_count: 0 },
  { id: "temple-arch", label: "Temple Architecture", label_ml: "ക്ഷേത്ര വാസ്തുവിദ്യ", icon: "⛩️", description: "The unique wooden and stone temple structures, Tharavadu mansions, and sacred architectural traditions of Kerala.", suggested_questions: ["Kerala temple style", "Padmanabhapuram Palace", "Tharavadu architecture"], article_count: 0 },
  { id: "festivals", label: "Festivals & Rituals", label_ml: "ഉത്സവങ്ങൾ & ആചാരങ്ങൾ", icon: "🎪", description: "Onam, Vishu, Thrissur Pooram, and the vibrant festival traditions that mark Kerala's cultural calendar.", suggested_questions: ["What is Thrissur Pooram?", "Onam traditions", "Vishu celebrations"], article_count: 0 },
  { id: "cuisine", label: "Cuisine", label_ml: "പാചകരീതി", icon: "🍛", description: "Traditional Sadhya feasts, spice-rich curries, regional cooking variations, and the culinary wisdom of Kerala.", suggested_questions: ["What is a Sadhya?", "Kerala spice history", "Traditional cooking methods"], article_count: 0 },
  { id: "cinema", label: "Malayalam Cinema", label_ml: "മലയാള സിനിമ", icon: "🎬", description: "From the New Wave movement to contemporary masters — the golden age and evolution of Mollywood.", suggested_questions: ["Malayalam New Wave cinema", "Adoor Gopalakrishnan films", "Evolution of Mollywood"], article_count: 0 },
  { id: "geography", label: "Geography & Nature", label_ml: "ഭൂമിശാസ്ത്രം & പ്രകൃതി", icon: "🌿", description: "Backwaters, Western Ghats, biodiversity hotspots, and the natural landscape that shapes Kerala's identity.", suggested_questions: ["Kerala backwaters", "Western Ghats biodiversity", "Geography of Kerala"], article_count: 0 },
]

export default function ExplorePage() {
  const router = useRouter()
  const [domains, setDomains] = useState<DomainInfo[]>(FALLBACK_DOMAINS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch("/api/domains")
        if (res.ok) {
          const data: DomainInfo[] = await res.json()
          if (data.length > 0) setDomains(data)
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false)
      }
    }
    fetchDomains()
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Nav Bar ──────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px clamp(16px, 4vw, 40px)",
          borderBottom: "1px solid var(--border-subtle)",
          gap: 8,
          flexWrap: "wrap",
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
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Chat", href: "/" },
            { label: "Explore", href: "/explore" },
            { label: "Contribute", href: "/contribute" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontFamily: "var(--font-ui)",
                fontSize: 13,
                color:
                  item.label === "Explore"
                    ? "var(--gold-dark)"
                    : "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: item.label === "Explore" ? 500 : 400,
                background:
                  item.label === "Explore" ? "var(--gold-subtle)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px) clamp(24px, 4vw, 48px)",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 400,
            color: "var(--crimson)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
            animation: "fade-up 0.5s ease-out",
          }}
        >
          Explore Kerala&apos;s Heritage
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            animation: "fade-up 0.6s ease-out",
          }}
        >
          Eight domains of cultural knowledge, from ancient performing arts to
          the landscapes of God&apos;s Own Country. Choose a domain to begin your
          exploration.
        </p>
      </div>

      {/* ── Domain Grid ──────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
          gap: 20,
          padding: "0 clamp(16px, 4vw, 40px) 80px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {domains.map((domain, i) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            index={i}
            loading={loading}
            onClick={() => router.push(`/?domain=${domain.id}`)}
            onQuestionClick={(q) =>
              router.push(`/?domain=${domain.id}&q=${encodeURIComponent(q)}`)
            }
          />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────── */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 32px 40px",
          borderTop: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-ui)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        Built by Weblyr AI ·{" "}
        <a
          href="/contribute"
          style={{ color: "var(--gold-dark)", textDecoration: "none" }}
        >
          Contribute Knowledge
        </a>
      </footer>
    </div>
  )
}

function DomainCard({
  domain,
  index,
  loading,
  onClick,
  onQuestionClick,
}: {
  domain: DomainInfo
  index: number
  loading: boolean
  onClick: () => void
  onQuestionClick: (q: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        border: hovered
          ? "1.5px solid var(--border-gold)"
          : "1px solid var(--border-subtle)",
        borderRadius: 16,
        padding: "28px 24px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: hovered
          ? "perspective(800px) rotateY(1deg) rotateX(-1deg) translateY(-4px)"
          : "perspective(800px) rotateY(0) rotateX(0) translateY(0)",
        boxShadow: hovered ? "var(--shadow-gold)" : "var(--shadow-sm)",
        animation: `fade-up 0.4s ease-out ${index * 0.06}s both`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow overlay on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 20%, rgba(200,149,42,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Icon + Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 32 }}>{domain.icon}</span>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {domain.label}
          </h2>
          <span
            style={{
              fontFamily: "var(--font-malayalam)",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            {domain.label_ml}
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        {domain.description}
      </p>

      {/* Article count */}
      <div
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <span
            style={{
              display: "inline-block",
              width: 80,
              height: 12,
              borderRadius: 4,
              background:
                "linear-gradient(90deg, var(--border-subtle) 25%, var(--bg-elevated) 50%, var(--border-subtle) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ) : (
          `${domain.article_count} articles indexed`
        )}
      </div>

      {/* Suggested questions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {domain.suggested_questions.map((q) => (
          <button
            key={q}
            onClick={(e) => {
              e.stopPropagation()
              onQuestionClick(q)
            }}
            style={{
              padding: "4px 10px",
              borderRadius: 100,
              border: "1px solid var(--border-default)",
              background: "transparent",
              fontFamily: "var(--font-ui)",
              fontSize: 11,
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gold-light)"
              e.currentTarget.style.color = "var(--gold-dark)"
              e.currentTarget.style.background = "var(--gold-subtle)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)"
              e.currentTarget.style.color = "var(--text-secondary)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
