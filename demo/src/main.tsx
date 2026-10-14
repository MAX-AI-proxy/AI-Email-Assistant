import { useState } from "react"
import { createRoot } from "react-dom/client"
import AppShell from "@/components/app-shell"
import MailWorkspace from "@/components/mail/mail-workspace"
import MailAnalysisCard from "@/components/mail/mail-analysis-card"
import type { MailAnalysis, MailAnalysisUsage } from "@/lib/ai/types"
import emails from "../data/emails.json"
import recorded from "../data/analyses.json"
import "@/app/globals.css"

type RecordedEntry = { uid: number; analysis: MailAnalysis; usage: MailAnalysisUsage; analyzedAt: string }
const entries = recorded.entries as RecordedEntry[]
const accounts = [{ id: "demo", name: "Demo Inbox", description: "Fiktive Nachrichten" }]
const accountData = { demo: { messages: emails, totalMessages: emails.length, loading: false, error: null } }

function Demo() {
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const message = emails.find(email => email.uid === selectedUid) ?? null
  const result = entries.find(entry => entry.uid === selectedUid)
  function select(uid: number | null) { setSelectedUid(uid); setShowAnalysis(false) }
  return <AppShell demo><div id="mail"><MailWorkspace demo
    accounts={accounts} accountData={accountData} activeAccount="demo"
    onAccountChange={() => select(null)} onRefresh={() => select(null)}
    selectedUid={selectedUid} selectedMessage={message} messageLoading={false} messageError={null}
    onMessageOpen={select} onMessageClose={() => select(null)}
    analysisPanel={result && <div className="space-y-3">
      <button type="button" aria-expanded={showAnalysis} onClick={() => setShowAnalysis(!showAnalysis)}
        className="rounded-xl border border-[#0a84ff]/30 bg-[#0a84ff]/10 px-4 py-3 text-sm font-medium text-[#80b8ff] hover:bg-[#0a84ff]/20">
        {showAnalysis ? "KI-Analyse schließen" : "Aufgezeichnete KI-Analyse öffnen"}
      </button>
      {showAnalysis && <MailAnalysisCard recorded result={{ ...result, cached: false }} />}
    </div>}
  /></div></AppShell>
}

createRoot(document.getElementById("root")!).render(<Demo />)
