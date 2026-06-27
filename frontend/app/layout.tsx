import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://keralagpt.ai"),
  title: "KeralaGPT — Samskriti | Kerala Cultural Intelligence Platform",
  description:
    "Explore 3,000 years of Kerala's culture, arts, history, cuisine, and wisdom powered by AI. Ask questions about Kathakali, Theyyam, Mohiniyattam, Malayalam literature, temple architecture, festivals, cinema, and more.",
  keywords: [
    "Kerala",
    "culture",
    "heritage",
    "AI",
    "Samskriti",
    "KeralaGPT",
    "Kathakali",
    "Theyyam",
    "Mohiniyattam",
    "Malayalam",
    "history",
    "performing arts",
    "Kerala cuisine",
    "temple architecture",
    "Onam",
    "backwaters",
    "Malayalam cinema",
    "Kerala history",
    "spice trade",
    "Ayurveda",
  ],
  authors: [{ name: "KeralaGPT Team" }],
  creator: "KeralaGPT",
  publisher: "KeralaGPT",
  applicationName: "KeralaGPT Samskriti",
  category: "Education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://keralagpt.ai",
    siteName: "KeralaGPT — Samskriti",
    title: "KeralaGPT — Kerala Cultural Intelligence Platform",
    description:
      "AI-powered exploration of Kerala's 3,000 years of culture, arts, history, cuisine, and wisdom. Curated knowledge across 8 cultural domains.",
    images: [
      {
        url: "/images/logo-lotus.svg",
        width: 120,
        height: 100,
        alt: "KeralaGPT Lotus Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeralaGPT — Kerala Cultural Intelligence Platform",
    description:
      "AI-powered exploration of Kerala's 3,000 years of culture, arts, history, and wisdom.",
    images: ["/images/logo-lotus.svg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo-lotus.svg",
  },
  manifest: undefined,
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0c090e" },
  ],
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
