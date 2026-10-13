# Public release preparation

Prepared on October 13, 2026 in a user-confirmed separate working copy.
No other private project folders or existing GitHub repositories were modified.
No GitHub repository, publication, commit or remote operation was created.

## Preserved application functionality

Two read-only IMAP adapters support T-Online and TU Braunschweig, account switching,
refresh, full parsed mail text and attachment metadata. T-Online retains structured
AI summaries, importance/action/deadline classification, automatic new-mail analysis,
local cache reuse, token/cost logging and duplicate-request suppression.
Sudoku and all six Logic Lab categories remain available with their existing
interactive controls, browser persistence, hints and solution explanations.
See `FEATURE_AUDIT.md` for the distinction between complete and partial features.

## Interface changes

The app starts directly in Mail. The original personal greeting and inactive
home/dashboard cards were removed. Sidebar links to absent calendar, knowledge,
project, interest, costs and settings pages were removed. Future Valorant,
Daily Challenge and statistics-page cards were removed. Existing dark styling
and desktop/mobile navigation were retained. Per-analysis token count and
estimated USD cost are displayed using recorded data, without invented totals.
A text-based SVG icon replaces the unused framework scaffold favicon.

## Privacy and server protection

The working copy initially contained no `.git`, `.max-ai-data`, `.env.local`,
`.next`, installed dependencies or logs. Source, configuration, asset contents,
file names and hidden entries were inspected. No real credentials, personal
email fixtures or private mail-derived datasets were found in the source set.
The only personal greeting was removed. Unused scaffold images and editor/OS
metadata are excluded from the public file allowlist.

The export copies explicit reviewed files only, writing new file contents to
exclude extended attributes and resource forks. It contains no secret environment
files, Git history, runtime data, dependencies, builds, logs or browser storage.
`PUBLIC_MANIFEST.json` records file sizes and SHA-256 checksums. A separate traversal
checks the completed folder against its allowlist and manifest, scans likely
secret patterns and rejects non-example email addresses, binaries and symlinks.
Pattern scans are supplementary checks, not proof against every possible secret.

Private AI/storage modules are marked `server-only`. Credentials have no
`NEXT_PUBLIC_` prefixes. API responses suppress provider exception details;
provider errors are not logged. APIs reject remote hosts and cross-origin browser
requests, and response headers disable caching. Start scripts bind to loopback.
Mail is displayed as escaped text; no mail HTML, remote images or scripts execute.
IMAP uses TLS, disabled protocol logging and read-only mailbox locks.

New runtime data files use owner-only POSIX permissions. Analysis caches and
polling state are separated by a hash of the configured account. They remain
unencrypted and must never be shared. Summaries can contain personal information.
Malformed analysis input is rejected before contacting OpenAI; oversized inputs,
invalid fields and incomplete/invalid model outputs are also rejected.

## Verification

- TypeScript: passed using `next typegen` and `tsc --noEmit`.
- ESLint: passed with no errors or warnings.
- Unit/integration tests: 77 passed across six test files, including mock IMAP/AI,
  persistence, new-mail state, input validation, origin checks, puzzle generation
  and public-export rejection cases.
- Production build: passed with Next.js 16.4.0 and Webpack.
- Browser tests: 3 passed in Chromium against the production build, covering
  direct entry, missing credentials, real API protection, mail/AI fixtures,
  rapid account switching, Logic Lab, Sudoku persistence and mobile navigation.
- Production dependency audit: 0 known vulnerabilities (`npm audit --omit=dev`).
- Full dependency audit: five high-severity entries from one development-only
  `braces` advisory chain (`braces` → `micromatch` → `fast-glob` → Next.js ESLint).
  npm proposes downgrading the Next.js ESLint configuration to version 14 as its
  fix; that incompatible downgrade was not applied. Do not lint untrusted glob
  patterns. See [the advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The GitHub Actions workflow repeats the local checks, browser tests, production
package audit and export audit. It has been prepared locally; no remote workflow
run or GitHub publication was triggered. Its action versions follow the official
[Checkout release](https://github.com/actions/checkout/releases/tag/v7.0.1) and
[Setup Node release](https://github.com/actions/setup-node/releases/tag/v7.1.0).

A clean disposable copy of the exact allowlisted source installed successfully
from the lockfile using `npm ci --offline --ignore-scripts`. TypeScript, ESLint,
all 77 tests and the production build also passed there, independently of the
working copy's installed dependencies. All three Chromium browser tests also
passed against that clean installation with runtime credentials explicitly blank.
A build with six synthetic credential
markers found none of those values in all 58 emitted client assets. This checks
the actual browser bundle as well as the source's server-only boundaries.
Dependencies and build outputs are excluded from the publication folder.

The final `MAX-AI_Public` directory is inside the confirmed working copy. It
contains 71 allowlisted files plus one checksum manifest (72 files total).
Independent audits passed from both the working copy and the exported folder.
Every exported source file matches its reviewed counterpart. `.git`, `.env.local`,
`.max-ai-data`, `.next`, `node_modules`, editor/OS files and test results are absent.
No sensitive-content pattern findings were reported in the publication set.

## Technical boundaries

Live IMAP authentication, real-message parsing and billed model execution were
intentionally not tested. Unit tests mock both providers and OpenAI; browser
fixtures contain only invented addresses and messages. A successful mock test
cannot guarantee a particular provider account's access or model entitlement.

The app is local and single-user, with no public authentication, OAuth, sending,
mail deletion, attachment download, complete mailbox synchronization or cloud sync.
Automatic analysis is browser-driven and limited to the current rolling window.
UIDVALIDITY resets require clearing local state. File queues and deduplication
assume one server process. Cost estimates are not invoices.

The production build uses Next.js's supported Webpack option because Turbopack's
CSS worker could not open a required local port in the execution sandbox.
No proprietary or paid service was invoked by the verification workflow.
No project license was selected; publishing source alone does not grant reuse rights.
