import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PMG Plant Hire Calculator",
    template: "%s | PMG Plant Hire Calculator",
  },
  description:
    "Calculate plant hire costs quickly and accurately. Track equipment usage, idle days, and generate invoice breakdowns for your plant hire operations.",
  keywords: [
    "plant hire",
    "equipment hire",
    "plant hire calculator",
    "hire cost calculator",
    "equipment rental",
    "invoice calculator",
  ],
  authors: [{ name: "PMG" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "PMG Plant Hire Calculator",
    description:
      "Calculate plant hire costs quickly and accurately. Track equipment usage, idle days, and generate invoice breakdowns.",
    siteName: "PMG Plant Hire Calculator",
  },
  twitter: {
    card: "summary",
    title: "PMG Plant Hire Calculator",
    description:
      "Calculate plant hire costs quickly and accurately. Track equipment usage, idle days, and generate invoice breakdowns.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
