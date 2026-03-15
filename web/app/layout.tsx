import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress } from "../components/ScrollProgress";
import dynamic from "next/dynamic";
import SkipNavLink from "../components/SkipNavLink";
const MobileCtaBar = dynamic(() => import("../components/MobileCtaBar"));
const MobileTabsNav = dynamic(() => import("../components/MobileTabsNav"));
import "./globals.css";

const FALLBACK_SITE_URL = 'https://patofalltrades.co.uk'

const resolveMetadataBase = () => {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL
  try {
    return new URL(candidate ?? FALLBACK_SITE_URL)
  } catch {
    return new URL(FALLBACK_SITE_URL)
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Pat Of All Trades | Premium London Handyman Services",
  description: "Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Pat Of All Trades | Premium London Handyman Services',
    description: 'Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.',
    images: [{ url: '/og-image.jpg' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pat Of All Trades | Premium London Handyman Services',
    description: 'Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.',
    images: ['/social-share.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth motion-enabled dark">
      <body className="bg-background text-foreground antialiased">
        <SkipNavLink />
        <ScrollProgress />
        {children}
        {/* Primary actions nav first in DOM for focus order */}
        <MobileCtaBar />
        {/* Secondary tabs nav after CTA in DOM */}
        <MobileTabsNav />
        <Analytics />
      </body>
    </html>
  );
}
