import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  options: [] as Record<string, unknown>[],
  connect: vi.fn(), status: vi.fn(), lock: vi.fn(), release: vi.fn(),
  fetchAll: vi.fn(), fetchOne: vi.fn(), logout: vi.fn(), parse: vi.fn(),
}))
vi.mock("imapflow", () => ({
  ImapFlow: class {
    usable = true
    constructor(options: Record<string, unknown>) { mocks.options.push(options) }
    connect = mocks.connect
    status = mocks.status
    getMailboxLock = mocks.lock
    fetchAll = mocks.fetchAll
    fetchOne = mocks.fetchOne
    logout = mocks.logout
  },
}))
vi.mock("mailparser", () => ({ simpleParser: mocks.parse }))

import { GET as tList } from "@/app/api/mail/t-online/messages/route"
import { GET as uList } from "@/app/api/mail/tu/messages/route"
import { GET as tDetail } from "@/app/api/mail/t-online/messages/[uid]/route"
import { GET as uDetail } from "@/app/api/mail/tu/messages/[uid]/route"
import { GET as tTest } from "@/app/api/mail/t-online/test/route"
import { GET as uTest } from "@/app/api/mail/tu/test/route"

const req = (path = "/api/mail/t-online/messages") => new Request(`http://127.0.0.1:3000${path}`)
const envelope = { from: [{ name: "Example Sender", address: "sender@example.test" }], to: [{ address: "recipient@example.test" }], subject: "Fictional message", date: new Date("2026-01-01T12:00:00Z") }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.options.length = 0
  for (const key of ["T_ONLINE_EMAIL", "T_ONLINE_APP_PASSWORD", "TU_EMAIL_ADDRESS", "TU_EMAIL_USERNAME", "TU_EMAIL_PASSWORD"]) vi.stubEnv(key, "")
  mocks.connect.mockResolvedValue(undefined)
  mocks.status.mockResolvedValue({ messages: 150, unseen: 2 })
  mocks.lock.mockResolvedValue({ release: mocks.release })
  mocks.logout.mockResolvedValue(undefined)
  mocks.fetchAll.mockResolvedValue([
    { uid: 1, envelope, flags: new Set(["\\Seen"]) },
    { uid: 2, envelope, flags: new Set() },
  ])
  mocks.fetchOne.mockResolvedValue({ uid: 2, envelope, flags: new Set(), source: Buffer.from("Fictional MIME fixture") })
  mocks.parse.mockResolvedValue({ text: "Fictional full message body.", attachments: [{ filename: "example.txt", contentType: "text/plain", size: 10, content: Buffer.from("private attachment bytes") }] })
})
function configure() {
  vi.stubEnv("T_ONLINE_EMAIL", "recipient@example.test")
  vi.stubEnv("T_ONLINE_APP_PASSWORD", "fictional-imap-password")
  vi.stubEnv("TU_EMAIL_ADDRESS", "student@example.test")
  vi.stubEnv("TU_EMAIL_USERNAME", "fictional-student-login")
  vi.stubEnv("TU_EMAIL_PASSWORD", "fictional-university-password")
}

describe.each([
  { name: "T-Online", list: tList, detail: tDetail, connection: tTest, range: "51:*", host: "secureimap.t-online.de" },
  { name: "TU", list: uList, detail: uDetail, connection: uTest, range: "131:150", host: "mail.tu-braunschweig.de" },
])("$name IMAP routes", ({ list, detail, connection, range, host }) => {
  test("missing credentials never create an IMAP connection", async () => {
    expect((await list(req())).status).toBe(503)
    expect((await detail(req(), { params: Promise.resolve({ uid: "1" }) })).status).toBe(503)
    expect((await connection(req())).status).toBe(503)
    expect(mocks.options).toHaveLength(0)
  })
  test("latest inbox messages, TLS, read-only lock and clean logout", async () => {
    configure()
    const response = await list(req())
    const data = await response.json()
    expect(data.messages.map((m: { uid: number }) => m.uid)).toEqual([2, 1])
    expect(data.messages[0].unread).toBe(true)
    expect(data.messages[1].unread).toBe(false)
    expect(data.totalMessages).toBe(150)
    expect(mocks.fetchAll.mock.calls[0][0]).toBe(range)
    expect(mocks.options[0]).toMatchObject({ host, port: 993, secure: true, logger: false })
    expect(mocks.lock).toHaveBeenCalledWith("INBOX", { readOnly: true })
    expect(mocks.release).toHaveBeenCalledOnce()
    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(JSON.stringify(data)).not.toContain("fictional-imap-password")
  })
  test("empty inbox does not fetch messages", async () => {
    configure(); mocks.status.mockResolvedValue({ messages: 0 })
    expect((await (await list(req())).json()).messages).toEqual([])
    expect(mocks.fetchAll).not.toHaveBeenCalled()
    expect(mocks.logout).toHaveBeenCalledOnce()
  })
  test("reads full body and attachment metadata, without attachment content", async () => {
    configure()
    const response = await detail(req(), { params: Promise.resolve({ uid: "2" }) })
    const data = await response.json()
    expect(data.message.text).toBe("Fictional full message body.")
    expect(data.message.attachments[0]).toEqual({ id: 0, filename: "example.txt", contentType: "text/plain", size: 10 })
    expect(JSON.stringify(data)).not.toContain("private attachment bytes")
    expect(mocks.fetchOne.mock.calls[0][2]).toEqual({ uid: true })
    expect(mocks.release).toHaveBeenCalledOnce()
    expect(mocks.logout).toHaveBeenCalledOnce()
  })
  test.each(["0", "-1", "bad", "1.5", "9007199254740992"])("rejects invalid UID %s", async uid => {
    configure()
    expect((await detail(req(), { params: Promise.resolve({ uid }) })).status).toBe(400)
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  test("missing message returns 404 and releases mailbox lock", async () => {
    configure(); mocks.fetchOne.mockResolvedValue(false)
    expect((await detail(req(), { params: Promise.resolve({ uid: "2" }) })).status).toBe(404)
    expect(mocks.release).toHaveBeenCalledOnce()
  })
  test("provider errors do not leak credentials or get logged", async () => {
    configure()
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.connect.mockRejectedValue(new Error("fictional-imap-password student@example.test"))
    for (const response of [await list(req()), await detail(req(), { params: Promise.resolve({ uid: "2" }) }), await connection(req())]) {
      expect(response.status).toBe(500)
      expect(await response.text()).not.toContain("fictional-imap-password")
    }
    expect(log).not.toHaveBeenCalled()
  })
  test("rejects remote origins before opening a connection", async () => {
    configure()
    const request = new Request(req(), { headers: { origin: "https://example.test" } })
    expect((await list(request)).status).toBe(403)
    expect(mocks.connect).not.toHaveBeenCalled()
  })
})
