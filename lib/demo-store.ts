"use client"

import { useCallback, useEffect, useState } from "react"

const PREFIX = "wms-demo:"

/** Read user-created demo rows persisted for this browser session. */
export function loadDemoEntries<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

/** Append a demo row so list pages can show entries created on standalone add forms. */
export function appendDemoEntry<T>(key: string, entry: T): void {
  const list = loadDemoEntries<T>(key)
  sessionStorage.setItem(PREFIX + key, JSON.stringify([entry, ...list]))
}

/** Merge session-persisted entries ahead of seeded rows (add forms → list pages). */
export function useDemoEntries<T>(key: string, seed: T[]): [T[], (entry: T) => void] {
  const [rows, setRows] = useState<T[]>(seed)

  useEffect(() => {
    const stored = loadDemoEntries<T>(key)
    if (stored.length) setRows([...stored, ...seed])
  }, [key, seed])

  const append = useCallback(
    (entry: T) => {
      appendDemoEntry(key, entry)
      setRows(prev => [entry, ...prev])
    },
    [key],
  )

  return [rows, append]
}
