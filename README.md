# MAX AI

A local email workspace with AI-assisted reading, built with Next.js,
TypeScript, and Tailwind CSS. A minimal dark interface brings two IMAP inboxes
into one application and turns T-Online messages into structured summaries.

## Why I built it

MAX AI began as a personal application: I wanted to read private and university
email in one place and identify what actually needed my attention.
I also added small interactive puzzles that I use alongside the mail workspace.

This public version contains the application code, with no personal credentials,
real emails, analysis caches, or private usage history. Configure your own
accounts and OpenAI API key to use the mail features. The interface is primarily
German; this documentation is English.

## Implemented features

| Area | What works |
| --- | --- |
| Mail | T-Online and TU Braunschweig IMAP inboxes, account switching and refresh |
| Reading | Full parsed text, sender, recipients, date, unread status and attachment metadata |
| AI | German summary, importance, action required, action, deadline, reply recommendation and category |
| Automation | Polling for new T-Online messages while the application is open |
| Persistence | Local analysis cache, usage log and automatic-analysis state |
| Usage | Model, token count and estimated USD cost shown for each analysis |
| Sudoku | Generated puzzles, three difficulties, notes, keyboard input and saved games |
| Logic Lab | Six question categories, three difficulties, hints, solutions and local results |

Mail is read-only: viewing messages does not mark them as read on the server.
The app retrieves the latest **100 T-Online messages** and **20 university messages**.
These are rolling inbox windows, not complete mailbox synchronization.
Attachment names, types and sizes are shown; attachment download is not implemented.

AI analysis is implemented for **T-Online only**. The university inbox supports
reading but does not send its messages to OpenAI.
Importance is classified and displayed on the selected mail; there is no
importance-sorted inbox or automated action execution.

## Technology

- Next.js App Router and React 19
- TypeScript and Tailwind CSS 4
- ImapFlow for IMAP over TLS; MailParser for MIME parsing
- OpenAI's Responses API with strict JSON-schema output
- Lucide icons, MathLive input and Nerdamer symbolic math
- Vitest for unit/integration tests; Playwright for browser tests

Use **Node.js 24 or later** and npm. Exact installed versions are recorded in
`package-lock.json`; installation uses `npm ci`.

## Architecture

```text
Browser (React)
  ├── Mail UI ───────────── /api/mail/{account}/messages[/uid]
  │                              └── IMAP over TLS, read-only INBOX
  ├── T-Online analysis ─── /api/ai/mail/analyze
  │                              ├── OpenAI Responses API
  │                              └── .max-ai-data/<account-hash>/
  ├── New-mail polling ──── /api/ai/mail/auto-state
  └── Sudoku / Logic Lab ── browser localStorage
```

The Node.js route handlers handle credentials, MIME parsing and external calls.
AI and persistence modules are marked `server-only`, so client imports fail
at build time. Credentials are read from server environment variables and are
never included in application props or API responses.

All API routes reject non-local hosts and cross-origin browser requests.
Responses are private and non-cacheable. The start scripts bind to `127.0.0.1`.
There is no user login or multi-user authorization: run this as a local,
single-user application, not as a public web service or through a tunnel.

## Install and configure

```bash
npm ci
cp .env.example .env.local
```

Edit `.env.local` with your own credentials. Unused accounts can remain blank.
The example intentionally has empty secret values, not working credentials.
Never rename secrets with a `NEXT_PUBLIC_` prefix.

| Variable | Purpose |
| --- | --- |
| `T_ONLINE_EMAIL` | Full T-Online email address |
| `T_ONLINE_APP_PASSWORD` | Separate provider-approved IMAP/app password |
| `TU_EMAIL_ADDRESS` | Your TU Braunschweig email address |
| `TU_EMAIL_USERNAME` | Institutional IMAP login name |
| `TU_EMAIL_PASSWORD` | Institutional IMAP password |
| `OPENAI_API_KEY` | Your own OpenAI API key |
| `MAX_AI_AUTO_ANALYSIS` | `false` disables background polling/analysis; default enabled |

The provider adapters use TLS on port 993:

- T-Online: `secureimap.t-online.de`, authenticating with the full email address.
- TU Braunschweig: `mail.tu-braunschweig.de`, authenticating with the IMAP username.

These are two specific adapters, not a general account-management system.
There is no Gmail/Outlook OAuth connection or settings screen for adding accounts.
Ask your provider or institution about current IMAP availability and credentials.
After changing environment variables, restart the application.

## Run

For development:

```bash
npm run dev
```

For an optimized production build:

```bash
npm run build
npm run start
```

Open **http://127.0.0.1:3000**. `/` redirects directly to `/mail`.
Without credentials, mail displays a configuration hint instead of crashing.
Sudoku and Logic Lab work independently of mail and AI configuration.

## How AI analysis works

Opening a T-Online message requests its analysis automatically. The server
reuses an existing result when the message content has not changed; concurrent
requests for the same analysis share one job in a single server process.
Cached results remain readable even if the API key is temporarily absent.

The analyzer uses **`gpt-6-luna`**, `reasoning.effort: none`, strict structured
output and `store: false`. It asks the model to treat mail as untrusted content,
avoid invented facts and distinguish concrete deadlines from vague urgency.
Returned fields are validated before saving the result.

Message text and relevant metadata are sent to OpenAI for analysis.
`store: false` disables response storage; it does not mean no provider-side
retention. See [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).
AI outputs can be wrong; verify decisions against the original email.

When both T-Online credentials and an API key exist, background polling runs
about once per minute while the app is open, with up to two analysis workers.
The first poll establishes a baseline and does not analyze old messages.
Later UIDs above the previous maximum are queued; failures remain pending while
those messages are still in the rolling inbox window.

Reading a message can incur API charges even with background analysis disabled.
No mail is sent and no reply or action is performed automatically.

## Storage and estimated cost

The app creates `.max-ai-data/<account-hash>/` at runtime:

- `mail-analysis-cache.json`: summaries, classifications and analysis usage.
- `ai-usage.json`: model, token counts, response IDs and estimated cost.
- `t-online-auto-analysis-state.json`: baseline and pending message UIDs.

These files are private, unencrypted local data. Summaries and metadata can
contain personal information. New files use owner-only permissions on POSIX
systems; do not share or commit the directory. Account addresses are hashed
for directory names, and changing the configured account starts a separate cache.
To clear mail-derived history, stop the app and delete `.max-ai-data` locally.

Costs are estimates, not billing records. The standard GPT-6 Luna rates checked
on October 13, 2026 are $0.10 input, $0.01 cached input, $0.125 cache write and
$0.50 output per million tokens. Regional premiums, processing tiers, taxes and
future price changes are not included. See the
[official model page](https://developers.openai.com/api/docs/models/gpt-6-luna).
Rates are centralized in `src/lib/ai/mail-analyzer.ts`.

Puzzle progress and results live in browser localStorage and are not part of the
repository. There is no cloud synchronization of either puzzles or mail data.

## Checks and tests

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
npm audit --omit=dev
```

Unit tests mock ImapFlow, MailParser and OpenAI. Filesystem tests use temporary
folders and synthetic messages; unexpected network fetches fail the tests.
Browser tests run against a production server with blank credentials and disabled
background analysis. Mail/AI interactions use fictional browser fixtures.
They also exercise the real APIs' missing-configuration and origin checks.
No real IMAP access, mail sending or paid OpenAI calls are needed for these tests.

The production dependency audit is clean at preparation time. The full audit
reports a development-only `braces` advisory through Next.js ESLint tooling;
there is no compatible fix reported by npm. See the release report.

## Current limitations

- Calendar, knowledge, project and interests integrations are not implemented.
- There is no separate costs dashboard or settings page.
- Logic Lab has no daily challenge or dedicated statistics page.
- No mailbox folders, paging, sending, deleting, attachment downloads or OAuth.
- Automatic analysis needs an open browser; there is no background service.
- IMAP UIDVALIDITY resets are not handled; clear local state after an inbox reset.
- JSON write queues and duplicate suppression assume one Node.js server process.
- Live provider authentication and model availability need your own credentials;
  the release checks use mocks and cannot certify a particular account's access.

## Public export

`npm run export:public` creates a new `MAX-AI_Public` folder **inside** the working
copy from an explicit file allowlist. It refuses to overwrite an existing folder,
does not copy Git history, and validates the result before finishing.

`npm run audit:public -- MAX-AI_Public` checks paths, file types, likely secrets,
non-example email addresses and manifest checksums independently.
The export contains no `.env.local`, `.git`, `.max-ai-data`, dependencies, builds,
logs, editor settings or operating-system metadata. See `docs/RELEASE_REPORT.md`
for the feature audit, verification results and release boundaries.
