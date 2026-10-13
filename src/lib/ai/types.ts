export type MailImportance =
  | "Niedrig"
  | "Mittel"
  | "Hoch"

export type YesNo =
  | "Ja"
  | "Nein"

export type MailCategory =
  | "Persönlich"
  | "Arbeit"
  | "Studium"
  | "Bestellung"
  | "Rechnung"
  | "Termin"
  | "Newsletter/Werbung"
  | "Konto/Sicherheit"
  | "Sonstiges"

export type MailAnalysis = {
  summary: string
  importance: MailImportance
  actionRequired: YesNo
  action: string
  deadline: string
  replyRecommended: YesNo
  category: MailCategory
}

export type MailForAnalysis = {
  uid?: string | number
  from: string
  to?: string
  subject: string
  date: string
  text: string
}

export type AnalyzeMailRequest = {
  account: "t-online"
  mail: MailForAnalysis
}

export type MailAnalysisUsage = {
  model: string
  inputTokens: number
  cachedInputTokens: number
  cacheWriteTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCostUsd: number
}

export type AnalyzeMailResponse = {
  analysis: MailAnalysis
  usage: MailAnalysisUsage
  cached: boolean
  cacheKey: string
  analyzedAt: string
}

export type AiUsageLogEntry = {
  id: string
  type: "mail-analysis"
  account: "t-online"
  cacheKey: string
  responseId: string
  analyzedAt: string
  usage: MailAnalysisUsage
}