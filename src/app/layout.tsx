import { connection } from "next/server"

import type {
  Metadata,
} from "next"

import "mathlive/fonts.css"
import "./globals.css"

import AppShell from "@/components/app-shell"

import TOnlineAutoAnalyzer from "@/components/mail/t-online-auto-analyzer"

export const metadata:
  Metadata = {
    title:
      "MAX AI",

    description:
      "Local email workspace with AI analysis and interactive puzzles",
  }

export default async function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode
}>) {
  await connection()
  const autoAnalysisEnabled = Boolean(
    process.env.T_ONLINE_EMAIL && process.env.T_ONLINE_APP_PASSWORD &&
    process.env.OPENAI_API_KEY && process.env.MAX_AI_AUTO_ANALYSIS !== "false"
  )

  return (
    <html lang="de">
      <body>
        <AppShell>
          {children}
        </AppShell>

        {autoAnalysisEnabled && <TOnlineAutoAnalyzer />}
      </body>
    </html>
  )
}