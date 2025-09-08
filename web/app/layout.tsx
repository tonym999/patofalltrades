import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress } from "../components/ScrollProgress";
import dynamic from "next/dynamic";
const MobileCtaBar = dynamic(() => import("../components/MobileCtaBar"));
const MobileTabsNav = dynamic(() => import("../components/MobileTabsNav"));
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Pat Of All Trades | Premium London Handyman Services",
  description: "Reliable. Professional. Unmatched Quality.",
  icons: {
    icon: '/logo.ico',
    shortcut: '/logo.ico',
    apple: '/logo.png',
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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
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
