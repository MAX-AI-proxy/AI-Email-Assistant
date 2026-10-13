import "server-only"

import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises"

import path from "node:path"
import { getDataDirectory } from "./data-directory"

type TOnlineAutoAnalysisState = {
  version: 1

  initialized:
    boolean

  highWatermark:
    number | null

  pendingUids:
    number[]

  initializedAt:
    string | null

  updatedAt:
    string | null
}

type SyncResult = {
  initializedNow:
    boolean

  baselineCount:
    number

  pendingUids:
    number[]

  highWatermark:
    number | null
}

const dataDirectory = getDataDirectory()

const statePath =
  path.join(
    dataDirectory,
    "t-online-auto-analysis-state.json"
  )

let stateQueue:
  Promise<unknown> =
    Promise.resolve()

function withStateLock<T>(
  task:
    () => Promise<T>
): Promise<T> {
  const result =
    stateQueue.then(
      task,
      task
    )

  stateQueue =
    result.then(
      () => undefined,
      () => undefined
    )

  return result
}

function emptyState():
  TOnlineAutoAnalysisState {
  return {
    version:
      1,

    initialized:
      false,

    highWatermark:
      null,

    pendingUids:
      [],

    initializedAt:
      null,

    updatedAt:
      null,
  }
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

async function readState():
  Promise<TOnlineAutoAnalysisState> {
  try {
    const content =
      await readFile(
        statePath,
        "utf8"
      )

    const parsed =
      JSON.parse(
        content
      ) as
        TOnlineAutoAnalysisState

    if (
      parsed.version !==
      1
    ) {
      return emptyState()
    }

    return {
      version:
        1,

      initialized:
        Boolean(
          parsed.initialized
        ),

      highWatermark:
        typeof parsed.highWatermark ===
          "number"
          ? parsed.highWatermark
          : null,

      pendingUids:
        Array.isArray(
          parsed.pendingUids
        )
          ? parsed.pendingUids.filter(
              (
                uid
              ): uid is number =>
                typeof uid ===
                  "number" &&
                Number.isInteger(
                  uid
                ) &&
                uid > 0
            )
          : [],

      initializedAt:
        parsed.initializedAt ??
        null,

      updatedAt:
        parsed.updatedAt ??
        null,
    }
  } catch {
    return emptyState()
  }
}

async function writeState(
  state:
    TOnlineAutoAnalysisState
) {
  await ensureDirectory()

  const temporaryPath =
    `${statePath}.tmp`

  await writeFile(
    temporaryPath,
    JSON.stringify(
      state,
      null,
      2
    ),
    { encoding: "utf8", mode: 0o600 }
  )

  await rename(
    temporaryPath,
    statePath
  )
}

function normalizeUids(
  values:
    number[]
) {
  return Array.from(
    new Set(
      values.filter(
        (
          uid
        ) =>
          Number.isInteger(
            uid
          ) &&
          uid > 0
      )
    )
  ).sort(
    (
      a,
      b
    ) =>
      a - b
  )
}

export async function syncTOnlineAutoAnalysis(
  currentUids:
    number[]
): Promise<SyncResult> {
  return withStateLock(
    async () => {
      const state =
        await readState()

      const uids =
        normalizeUids(
          currentUids
        )

      const now =
        new Date()
          .toISOString()

      const currentMax =
        uids.length >
        0
          ? uids[
              uids.length -
                1
            ]
          : null

      /*
       * First ever run:
       *
       * Everything currently visible
       * is considered old mail.
       * Nothing is sent to AI.
       */
      if (
        !state.initialized
      ) {
        const nextState:
          TOnlineAutoAnalysisState = {
            version:
              1,

            initialized:
              true,

            highWatermark:
              currentMax,

            pendingUids:
              [],

            initializedAt:
              now,

            updatedAt:
              now,
          }

        await writeState(
          nextState
        )

        return {
          initializedNow:
            true,

          baselineCount:
            uids.length,

          pendingUids:
            [],

          highWatermark:
            currentMax,
        }
      }

      const currentSet =
        new Set(
          uids
        )

      /*
       * Keep failed/pending new mails
       * only while they are still
       * inside our rolling 100.
       */
      const stillPending =
        state.pendingUids.filter(
          (
            uid
          ) =>
            currentSet.has(
              uid
            )
        )

      /*
       * A UID larger than every UID
       * we have seen before represents
       * a genuinely newer message.
       *
       * Deleting mails does not make
       * an older UID new.
       */
      const newlyDetected =
        state.highWatermark ===
        null
          ? uids
          : uids.filter(
              (
                uid
              ) =>
                uid >
                (
                  state.highWatermark ??
                  0
                )
            )

      const pendingUids =
        normalizeUids([
          ...stillPending,
          ...newlyDetected,
        ])

      let highWatermark =
        state.highWatermark

      if (
        currentMax !==
        null
      ) {
        highWatermark =
          highWatermark ===
          null
            ? currentMax
            : Math.max(
                highWatermark,
                currentMax
              )
      }

      const nextState:
        TOnlineAutoAnalysisState = {
          ...state,

          highWatermark,

          pendingUids,

          updatedAt:
            now,
        }

      await writeState(
        nextState
      )

      return {
        initializedNow:
          false,

        baselineCount:
          0,

        pendingUids,

        highWatermark,
      }
    }
  )
}

export async function completeTOnlineAutoAnalysis(
  completedUids:
    number[]
) {
  return withStateLock(
    async () => {
      const state =
        await readState()

      const completed =
        new Set(
          normalizeUids(
            completedUids
          )
        )

      const nextState:
        TOnlineAutoAnalysisState = {
          ...state,

          pendingUids:
            state.pendingUids.filter(
              (
                uid
              ) =>
                !completed.has(
                  uid
                )
            ),

          updatedAt:
            new Date()
              .toISOString(),
        }

      await writeState(
        nextState
      )

      return nextState
    }
  )
}