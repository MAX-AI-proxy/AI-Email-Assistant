# Source-based feature audit

Audited on October 13, 2026. “Implemented” means the source contains the complete
application path and it is exercised with synthetic tests where applicable;
live account authentication and paid API calls were intentionally not performed.

| Feature | Status | Source / boundary |
| --- | --- | --- |
| Desktop/mobile navigation | Implemented | `src/components/app-shell.tsx`; Mail and Spielwiese only |
| Direct mail entry | Implemented | `src/app/page.tsx` redirects to `/mail` |
| T-Online inbox | Implemented | `src/app/api/mail/t-online/`; TLS, latest 100, read-only |
| TU Braunschweig inbox | Implemented | `src/app/api/mail/tu/`; TLS, latest 20, separate login |
| Account switching and refresh | Implemented | `src/app/mail/page.tsx`; stale detail results are ignored |
| Full email reading | Implemented | UID detail handlers and MailParser; parsed text, not raw HTML |
| Unread status | Implemented, display only | IMAP Seen flag is read, never modified |
| Attachments | Partial | Name, content type and size only; no download endpoint |
| Summary, importance, action, deadline, reply recommendation, category | Implemented for T-Online | `src/lib/ai/mail-analyzer.ts`; structured validated output |
| University AI analysis | Not implemented | University mail is excluded from analysis UI |
| Importance sorting/filtering | Not implemented | Classification badge only; newest-first inbox |
| Automatic new-mail analysis | Implemented, bounded | Client polling every minute; first-run baseline, rolling 100 and retry queue |
| Analysis reuse and duplicate suppression | Implemented | SHA-256 content/model keys, JSON cache, per-process running-job map |
| Usage/cost recording | Implemented | `ai-usage.json`; estimates from reported token details |
| Cost overview page | Placeholder removed | `/kosten` never had a page; per-analysis usage is now visible |
| Settings page | Placeholder removed | `/einstellungen` never had a page; local environment setup documented |
| Calendar, knowledge, projects, interests | Placeholders removed | Navigation referenced routes with no pages or integration code |
| Original home dashboard | Placeholder replaced | Personal greeting, future calendar/Valorant cards and inactive button removed |
| Sudoku | Implemented | Unique generated puzzles, three levels, notes, keyboard control, restore/reset |
| Logic Lab | Implemented | Sequences, grids, math logic, derivatives, integrals and limits |
| Logic Lab modes | Implemented | Quick Play and Endless, difficulty/category selection, hints and solution explanations |
| Logic Lab results | Implemented locally | Score, attempts, timing, saved slots and category statistics in localStorage |
| Daily Challenge | Placeholder removed | Informational card had no daily generator or playable route |
| Dedicated game statistics page | Placeholder removed | Local statistics remain; the future-page card is removed |
| Valorant integration / eco calculator | Not implemented | Only future cards existed; removed |
| Sending, replies, deletion, OAuth, cloud sync | Not implemented | No corresponding implementation is claimed |

No functional games were removed. Mail retrieval, AI analysis, local caching,
new-mail detection and usage logging remain connected to their original UI paths.
