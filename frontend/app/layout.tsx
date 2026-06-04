import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KeralaGPT — Samskriti",
  description: "3,000 years of Kerala culture, arts, history, and wisdom.",
  keywords: ["Kerala", "culture", "heritage", "AI", "Samskriti"],
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
      <body>{children}</body>
    </html>
  )
}
