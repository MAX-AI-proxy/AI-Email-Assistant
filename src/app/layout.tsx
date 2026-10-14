import { connection } from "next/server"

import type {
  Metadata,
} from "next"

import "./globals.css"

import AppShell from "@/components/app-shell"

import TOnlineAutoAnalyzer from "@/components/mail/t-online-auto-analyzer"

export const metadata:
  Metadata = {
    title:
      "AI Email Assistant",

    description:
      "Local IMAP email workspace with AI summaries, prioritization and action detection",
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