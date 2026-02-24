import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Notes — Notion-Style Note Taking with AI",
  description:
    "A modern AI-powered note-taking app with a Notion-style block editor. Create, organize, and enhance your notes with AI summaries, writing improvements, and auto-tagging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes adds "class" to <html> dynamically
    // which can cause a mismatch between server and client renders.
    // This attribute silences that specific warning — it's expected and safe.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Providers wraps the entire app with QueryClient, ThemeProvider, and Toaster */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
