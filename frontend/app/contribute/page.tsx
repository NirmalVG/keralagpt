"use client"

import { useState } from "react"
import { DOMAINS } from "@/lib/types/chat"

type FormData = {
  title: string
  domain: string
  content: string
  source_url: string
  contributor_name: string
  contributor_credentials: string
}

export default function ContributePage() {
  const [form, setForm] = useState<FormData>({
    title: "",
    domain: "",
    content: "",
    source_url: "",
    contributor_name: "",
    contributor_credentials: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.domain &&
    form.content.trim().length >= 20

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          domain: form.domain,
          content: form.content.trim(),
          source_url: form.source_url.trim() || null,
          contributor_name: form.contributor_name.trim() || null,
          contributor_credentials: form.contributor_credentials.trim() || null,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.detail || "Submission failed. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

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
          padding: "16px 40px",
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
                  item.label === "Contribute"
                    ? "var(--gold-dark)"
                    : "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: item.label === "Contribute" ? 500 : 400,
                background:
                  item.label === "Contribute"
                    ? "var(--gold-subtle)"
                    : "transparent",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 40px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* ── Left: Form ─────────────────────────── */}
        <div style={{ animation: "fade-up 0.4s ease-out" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              fontWeight: 400,
              color: "var(--crimson)",
              marginBottom: 8,
            }}
          >
            Contribute Knowledge
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            Share your expertise about Kerala&apos;s culture, arts, and
            heritage. Approved contributions are ingested into the KeralaGPT
            knowledge base, making them accessible to everyone.
          </p>

          {submitted ? (
            /* Success State */
            <div
              style={{
                background: "var(--bg-card)",
                border: "2px solid var(--jade)",
                borderRadius: 16,
                padding: "48px 32px",
                textAlign: "center",
                animation: "fade-up 0.4s ease-out",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(26,107,60,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto 20px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Contribution Submitted!
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  marginBottom: 24,
                }}
              >
                Thank you for helping preserve Kerala&apos;s heritage. Your
                submission will be reviewed by our team.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setForm({
                    title: "",
                    domain: "",
                    content: "",
                    source_url: "",
                    contributor_name: "",
                    contributor_credentials: "",
                  })
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--gold-dark)",
                  color: "#FAF7F2",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Submit Another
              </button>
            </div>
          ) : (
            /* Form */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <FormField
                label="Title *"
                placeholder="e.g., The Significance of Theyyam Rituals in North Malabar"
              >
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Title of your contribution"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Domain *" placeholder="">
                <select
                  value={form.domain}
                  onChange={(e) => update("domain", e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    color: form.domain
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  <option value="">Select a domain...</option>
                  {DOMAINS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Content *"
                placeholder="Minimum 20 characters"
              >
                <textarea
                  value={form.content}
                  onChange={(e) => update("content", e.target.value)}
                  placeholder="Share your knowledge... Be as detailed and factual as possible. Include dates, names, and specific details where applicable."
                  rows={8}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 160,
                    lineHeight: 1.7,
                  }}
                />
              </FormField>

              <FormField label="Source URL" placeholder="Optional">
                <input
                  type="url"
                  value={form.source_url}
                  onChange={(e) => update("source_url", e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </FormField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <FormField label="Your Name" placeholder="Optional">
                  <input
                    type="text"
                    value={form.contributor_name}
                    onChange={(e) => update("contributor_name", e.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Credentials" placeholder="Optional">
                  <input
                    type="text"
                    value={form.contributor_credentials}
                    onChange={(e) =>
                      update("contributor_credentials", e.target.value)
                    }
                    placeholder="e.g., PhD in Dravidian Arts"
                    style={inputStyle}
                  />
                </FormField>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(139,32,16,0.08)",
                    border: "1px solid rgba(139,32,16,0.2)",
                    fontFamily: "var(--font-ui)",
                    fontSize: 13,
                    color: "var(--crimson)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{
                  padding: "14px 32px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    canSubmit && !submitting
                      ? "var(--gold-dark)"
                      : "var(--border-subtle)",
                  color:
                    canSubmit && !submitting ? "#FAF7F2" : "var(--text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor:
                    canSubmit && !submitting ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  boxShadow:
                    canSubmit && !submitting ? "var(--shadow-gold)" : "none",
                  alignSelf: "flex-start",
                }}
              >
                {submitting ? "Submitting..." : "Submit Contribution"}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Info Panel ───────────────────── */}
        <div
          style={{
            position: "sticky",
            top: 32,
            animation: "fade-up 0.5s ease-out 0.15s both",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "var(--text-primary)",
              marginBottom: 20,
            }}
          >
            Why Contribute?
          </h3>

          {[
            {
              icon: "🏛️",
              title: "Preserve Heritage",
              desc: "Help preserve Kerala's cultural knowledge for future generations. Many traditions exist only in oral form — your documentation makes them permanent.",
            },
            {
              icon: "🌍",
              title: "Global Access",
              desc: "Make regional knowledge accessible to the global Keralite diaspora, researchers, and curious minds worldwide.",
            },
            {
              icon: "⭐",
              title: "Get Credited",
              desc: "Contributors are recognized on our platform. Your expertise becomes part of a growing cultural knowledge base.",
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: "20px 18px",
                marginBottom: 12,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-gold)"
                e.currentTarget.style.boxShadow = "var(--shadow-sm)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 22 }}>{benefit.icon}</span>
                <h4
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--gold-dark)",
                    margin: 0,
                  }}
                >
                  {benefit.title}
                </h4>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {benefit.desc}
              </p>
            </div>
          ))}

          <div
            style={{
              marginTop: 24,
              padding: "16px 18px",
              borderRadius: 12,
              background: "var(--gold-subtle)",
              border: "1px solid var(--border-gold)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: 12,
                color: "var(--gold-dark)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <strong>Quality Guidelines:</strong> Submissions should be
              factual, well-sourced, and specific to Kerala&apos;s culture.
              Opinion pieces and social media content are not accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--border-default)",
  background: "var(--bg-elevated)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "var(--text-primary)",
  outline: "none",
  transition: "all 0.2s ease",
}

function FormField({
  label,
  placeholder,
  children,
}: {
  label: string
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-secondary)",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
        {placeholder && (
          <span
            style={{
              fontWeight: 400,
              color: "var(--text-muted)",
              marginLeft: 6,
            }}
          >
            ({placeholder})
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
