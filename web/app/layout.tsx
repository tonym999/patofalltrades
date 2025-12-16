import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress } from "../components/ScrollProgress";
import dynamic from "next/dynamic";
import ClientOnly from "../components/ClientOnly";
import SkipNavLink from "../components/SkipNavLink";
const MobileCtaBar = dynamic(() => import("../components/MobileCtaBar"));
const MobileTabsNav = dynamic(() => import("../components/MobileTabsNav"));
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Pat Of All Trades | Premium London Handyman Services",
  description: "Reliable. Professional. Unmatched Quality.",
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
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
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SkipNavLink />
        <ScrollProgress />
        {children}
        {/* Primary actions nav first in DOM for focus order */}
        <ClientOnly>
          <MobileCtaBar />
        </ClientOnly>
        {/* Secondary tabs nav after CTA in DOM */}
        <ClientOnly>
          <MobileTabsNav />
        </ClientOnly>
        <Analytics />
      </body>
    </html>
  );
}
