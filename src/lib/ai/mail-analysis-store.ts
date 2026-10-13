import "server-only"

import {
  createHash,
  randomUUID,
} from "node:crypto"

import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises"

import path from "node:path"
import { getDataDirectory } from "./data-directory"

import type {
  AiUsageLogEntry,
  AnalyzeMailResponse,
  MailForAnalysis,
} from "./types"

type CacheFile = {
  version: 1

  entries: Record<
    string,
    AnalyzeMailResponse
  >
}

type UsageFile = {
  version: 1

  entries:
    AiUsageLogEntry[]
}

const dataDirectory = getDataDirectory()

const cachePath =
  path.join(
    dataDirectory,
    "mail-analysis-cache.json"
  )

const usagePath =
  path.join(
    dataDirectory,
    "ai-usage.json"
  )

let writeQueue:
  Promise<void> =
    Promise.resolve()

function queueWrite(
  task: () => Promise<void>
) {
  const next =
    writeQueue.then(
      task,
      task
    )

  writeQueue =
    next.catch(
      () => undefined
    )

  return next
}

async function ensureDirectory() {
  await mkdir(
    dataDirectory,
    {
      recursive: true,
      mode: 0o700,
    }
  )
}

async function readJson<T>(
  filePath: string,
  fallback: T
): Promise<T> {
  try {
    const content =
      await readFile(
        filePath,
        "utf8"
      )

    return JSON.parse(
      content
    ) as T
  } catch {
    return fallback
  }
}

async function atomicWrite(
  filePath: string,
  data: unknown
) {
  await ensureDirectory()

  const temporaryPath =
    `${filePath}.tmp`

  await writeFile(
    temporaryPath,
    JSON.stringify(
      data,
      null,
      2
    ),
    { encoding: "utf8", mode: 0o600 }
  )

  await rename(
    temporaryPath,
    filePath
  )
}

export function createMailCacheKey(
  mail: MailForAnalysis
) {
  const normalized =
    JSON.stringify({
      model: "gpt-6-luna",
      analysisVersion: 1,
      uid:
        mail.uid ?? "",

      from:
        mail.from ?? "",

      to:
        mail.to ?? "",

      subject:
        mail.subject ?? "",

      date:
        mail.date ?? "",

      text:
        mail.text ?? "",
    })

  return createHash(
    "sha256"
  )
    .update(
      normalized
    )
    .digest(
      "hex"
    )
}

export async function getCachedMailAnalysis(
  cacheKey: string
) {
  const cache =
    await readJson<CacheFile>(
      cachePath,
      {
        version: 1,
        entries: {},
      }
    )

  return (
    cache.entries[
      cacheKey
    ] ?? null
  )
}

export async function saveMailAnalysis(
  cacheKey: string,
  response: AnalyzeMailResponse
) {
  await queueWrite(
    async () => {
      const cache =
        await readJson<CacheFile>(
          cachePath,
          {
            version: 1,
            entries: {},
          }
        )

      cache.entries[
        cacheKey
      ] =
        response

      await atomicWrite(
        cachePath,
        cache
      )
    }
  )
}

export async function logMailAnalysisUsage(
  params: {
    cacheKey: string
    responseId: string
    analyzedAt: string
    response: AnalyzeMailResponse
  }
) {
  await queueWrite(
    async () => {
      const usage =
        await readJson<UsageFile>(
          usagePath,
          {
            version: 1,
            entries: [],
          }
        )

      usage.entries.push({
        id:
          randomUUID(),

        type:
          "mail-analysis",

        account:
          "t-online",

        cacheKey:
          params.cacheKey,

        responseId:
          params.responseId,

        analyzedAt:
          params.analyzedAt,

        usage:
          params.response
            .usage,
      })

      await atomicWrite(
        usagePath,
        usage
      )
    }
  )
}