# Feature audit — AI Email Assistant

Reviewed on October 14, 2026. Live mail tests use invented fixtures and mocked
providers. Only the five independent fictional demo messages were sent to OpenAI.
No personal mail account was accessed.

| Feature | Implementation / boundary |
| --- | --- |
| Mail entry and desktop/mobile navigation | Direct `/mail`; shared AppShell and MailWorkspace |
| Two IMAP inboxes | Original T-Online/TU read-only TLS adapters retained; latest 100/20 messages |
| Reading | Parsed text, sender, recipients, date, unread status, attachment metadata |
| AI analysis | Existing T-Online Responses API, schema and validator; university AI remains unsupported |
| Summaries and decisions | Summary, priority, action, deadline, reply recommendation, category |
| Local persistence | Private account-scoped cache, usage log, automatic-analysis state |
| Background analysis | Original browser-driven new-UID detection, bounded queue and reuse retained |
| Demo | Five invented messages and five actual validated model outputs, shared mail and result UI |
| Static hosting | Independent Vite bundle, correct Pages base path, CSP denies data connections |
| Screenshots | Actual demo captures with invented content only; PNG metadata forbidden |
| Games | All Sudoku, Logic Lab, puzzle routes/components/tests and math dependencies removed |
| Sending, deletion, OAuth, attachment downloads | Not implemented; no claims to the contrary |

The live fetch/state adapter was extracted from the original page, and the result
card was extracted from the original analysis component. Server routes, cache,
new-mail detection, usage logging and their safeguards remain in the productive
Next.js application. The static entry imports only the shared display components
and bundled demo data.
