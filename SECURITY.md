# Security and privacy

AI Email Assistant is a local, single-user application. Start scripts bind to 127.0.0.1;
API handlers reject remote hosts, mismatched origins and cross-site browser calls.
These checks are not a public authentication system. Do not expose the server
through a public deployment, tunnel, or reverse proxy without designing
appropriate authentication, authorization and storage isolation first.

Supply credentials in `.env.local`. Never expose keys or passwords with
`NEXT_PUBLIC_`, commit secrets, or include `.max-ai-data` in an upload.
Server-only imports protect private modules from accidental client bundling.
Provider errors are replaced with fixed user-facing messages and are not logged.

Mail contents are untrusted. The app displays parsed text without inserting
email HTML, external images or scripts. IMAP connections use TLS and read-only
mailbox locks. No sending, deleting, or message-flag updates are implemented.

AI analysis sends message content and metadata to OpenAI. Review provider data
controls before using sensitive mail. Local summaries are unencrypted and can
contain private information even though the original message text is not cached.

The public export uses a file allowlist and a supplementary pattern scan.
Pattern scanning is useful but cannot prove the absence of all possible secrets.
Review any new files, test fixtures and screenshots before sharing them.
Never report a vulnerability by posting real mail, passwords or API keys.

No license has been selected for the project. Public repository visibility
alone does not grant additional reuse rights.

The public GitHub Pages site contains only a separate static React bundle.
It displays five invented messages and genuine prerecorded analyses; its CSP
blocks outgoing data connections. No live API handlers are deployed there.

Binary publication is restricted to three reviewed PNG screenshots. The audit
rejects text/EXIF metadata, unknown PNG chunks, corrupt checksums, symlinks and
all other unreviewed binaries. The actual Git index is audited against the
allowlist and SHA-256 manifest before upload. The generation journal and the
temporary API key stay outside this publication set.
