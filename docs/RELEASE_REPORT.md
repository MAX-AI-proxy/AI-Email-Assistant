# AI Email Assistant — portfolio release

Prepared on October 14, 2026 exclusively in the separate public project copy.
The original personal project, previous working copy and private repository are
outside this release scope and were not modified.

## Product and architecture

The application is renamed AI Email Assistant. All game routes, modules,
components, tests and MathLive/Nerdamer dependencies are removed. The original
productive mail API, IMAP adapters, MIME parsing, AI schema/validation, local
cache, usage log and new-mail automation remain available locally.

Live and demo share the shell, inbox/reader and analysis card. Vite builds only
the separate static entry and bundled demo records for GitHub Pages; Next.js
builds the full local server application independently. Public visits require
no backend, credentials, model calls, IMAP connections or paid services.
The static document has `connect-src 'none'` and uses the renamed repository's
Pages base path. CI uploads only `demo/dist` after all verification passes.

## Genuine demo data

Five completely fictional messages were written independently for urgent action,
a sample invoice, a newsletter, a project meeting and a personal greeting.
All addresses use example.com. No actual mailbox or personal cache was read.

After separate explicit user approval, exactly five OpenAI Responses API calls
used the existing analyzer and validator with SDK retries disabled. All five
completed and passed validation. The unchanged model outputs and reported usage
are stored in `demo/data/analyses.json`, bound to the fictional input by SHA-256.
No response IDs, credentials or private runtime records are published.

Reported aggregate usage: **4,681 tokens**. Analyzer-calculated estimated cost:
**$0.0006877 USD** (estimate, not an invoice). The temporary `.env.local` key
file was deleted after successful generation. The private journal reserves
attempts before sending and prevents automatic repetition beyond the five-call
budget; it remains excluded by `.gitignore` and the public allowlist.

## Verification

- TypeScript and ESLint: passed.
- Vitest: **69 tests passed** across six files, including retained mail/AI,
  request security, private persistence and public-export tests, plus genuine
  demo record checks and strict screenshot rejection tests.
- Productive Next.js production build: passed; all eight API routes retained.
- Static Vite production build: passed independently without secrets.
- Live Chromium browser tests: **3 passed**, covering missing configuration,
  actual origin guards, fictional mail/AI fixtures, stale account-switch results,
  mobile navigation and removed game routes returning 404.
- Demo Chromium browser tests: **2 functional tests passed**, opening all five
  messages and comparing all saved result fields/usage, closing analyses,
  mobile switching/back navigation and absence of API/external-origin requests.
- Explicit screenshot capture test: passed; three actual demo PNGs visually
  reviewed, containing fictional content only. CI intentionally skips capture
  and verifies the already reviewed screenshot hashes instead.
- Production dependency audit: **0 known vulnerabilities**.
- Full dependency audit: five high-severity entries from the existing development
  `braces` → `micromatch` → `fast-glob` → Next ESLint chain. npm suggests an
  incompatible downgrade to Next ESLint 14; it was not applied. No tests or
  security rules were weakened. See [the advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## Publication controls

The explicit allowlist contains **68 source/documentation/asset files**, plus
`PUBLIC_MANIFEST.json` (**69 published files**). The manifest records size and
SHA-256 per allowlisted file. Export writes fresh bytes, refuses existing output,
rejects symlinks and checks the completed folder independently.

Only three explicitly named, visually reviewed PNG screenshots are allowed as
binary assets. Signature, chunk structure, bounds and CRCs are checked; text,
EXIF and unknown chunks are rejected. Other binaries remain forbidden. Secret,
private-key, personal filesystem-path and non-example-address checks are retained.
A separate audit materializes every actual Git index blob and verifies the same
allowlist and manifest before committing/pushing; modes other than regular 644
files and unresolved index entries are rejected.

`.env.local`, `.max-ai-data`, dependencies, generated Next/Vite bundles, test
results, logs and local editor/OS files are excluded. Pattern scanning is a
supplementary safeguard rather than a guarantee against every possible secret.
Remote CI, deployment, public browser checks and local/remote commit identity
are verified separately after upload; this source report records the local
release checks rather than claiming a future workflow result.

## Boundaries

Live account authentication was not tested: mocked tests cannot certify a user's
provider access. The live application remains single-user and local; no public
live API is deployed. The demo is static and cannot analyze visitors' mail.
AI can misclassify messages; outputs are faithfully recorded, not hand-corrected.
There is no sending, deletion, OAuth, attachment download, full synchronization,
cloud cache or selected project license. Private caches remain unencrypted.
