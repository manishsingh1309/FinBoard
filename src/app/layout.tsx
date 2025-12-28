import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AIAssistant } from "@/components/ai-assistant"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "FinBoard",
  description: "FinBoard is a modern, full-stack Next.js application that enables users to create customizable financial dashboards with real-time data visualization. The architecture follows a component-based design with clear separation of concerns.",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <AIAssistant />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
