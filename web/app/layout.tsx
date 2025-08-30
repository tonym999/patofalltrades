import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress } from "../components/ScrollProgress";
import StickyContactBar from "../components/StickyContactBar";
import dynamic from "next/dynamic";
const MobileCtaBar = dynamic(() => import("../components/MobileCtaBar"), { ssr: false });
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
        <StickyContactBar />
        <MobileCtaBar />
        <Analytics />
      </body>
    </html>
  );
}
