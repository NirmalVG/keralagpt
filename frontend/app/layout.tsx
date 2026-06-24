import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KeralaGPT — Samskriti",
  description:
    "Kerala Cultural Intelligence Platform — 3,000 years of culture, arts, history, and wisdom powered by AI.",
  keywords: [
    "Kerala",
    "culture",
    "heritage",
    "AI",
    "Samskriti",
    "Kathakali",
    "Theyyam",
    "Malayalam",
    "history",
    "performing arts",
  ],
  authors: [{ name: "Weblyr AI" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning is required because we inject the `dark` class
        on <html> from localStorage before React hydrates, to prevent flash.
      */}
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inline script — runs before React hydrates, prevents dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('keralagpt-theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
