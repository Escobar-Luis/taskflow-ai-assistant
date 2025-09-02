import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: "TaskFlow - AI-Powered Task Management",
  description:
    "Streamline your productivity with AI-powered task management, real-time collaboration, and intelligent automation.",
  keywords: [
    "task management",
    "productivity",
    "AI",
    "collaboration",
    "project management",
  ],
  authors: [{ name: "TaskFlow Team" }],
  openGraph: {
    title: "TaskFlow - AI-Powered Task Management",
    description:
      "Streamline your productivity with AI-powered task management platform",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow - AI-Powered Task Management",
    description:
      "Streamline your productivity with AI-powered task management platform",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
