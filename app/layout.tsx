import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { AOSProvider } from "@/components/providers/aos-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppErrorBoundary } from "@/components/shared/error-boundary";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { FeedbackWidget } from "@/components/shared/feedback-widget";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlloySphere - The Startup Operating System",
  description: "Command center for high-growth ventures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark antialiased h-full`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden relative">
        <AppErrorBoundary>
          <PostHogProvider>
            <AOSProvider />
            <AuthProvider>
              {children}
              <FeedbackWidget />
            </AuthProvider>
          </PostHogProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
