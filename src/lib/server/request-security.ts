import "server-only"

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"])

// This is a local, single-user application, with no public authentication layer.
// Check every handler before accessing mail, local files, or billable services.
export function requireLocalRequest(request: Request): Response | null {
  const url = new URL(request.url)
  const host = request.headers.get("host") ?? url.host
  let validHost = false
  let expectedOrigin = url.origin
  try {
    const hostUrl = new URL(`${url.protocol}//${host}`)
    // Next.js can normalize the internal request URL to localhost while the
    // browser uses 127.0.0.1. Host is the browser authority; both must be local.
    validHost = loopbackHosts.has(hostUrl.hostname) &&
      loopbackHosts.has(url.hostname) && hostUrl.port === url.port
    expectedOrigin = hostUrl.origin
  } catch {
    // Malformed Host headers are rejected.
  }
  const origin = request.headers.get("origin")
  const fetchSite = request.headers.get("sec-fetch-site")
  if (!validHost || (origin !== null && origin !== expectedOrigin) ||
      (fetchSite !== null && !["same-origin", "none"].includes(fetchSite))) {
    return Response.json(
      { ok: false, error: "Diese API ist nur lokal und über dieselbe Herkunft erreichbar." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    )
  }
  return null
}
