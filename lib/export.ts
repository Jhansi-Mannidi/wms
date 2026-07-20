/**
 * Export utilities for VoltusFreight WMS
 * Supports CSV and JSON download via native browser Blob API — no external deps required.
 */

type Row = Record<string, unknown>

/** Convert array of objects → CSV string */
function toCSV(data: Row[]): string {
  if (!data.length) return ""
  const headers = Object.keys(data[0])
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

/** Trigger a browser file download */
function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Download data as a CSV file */
export function exportCSV(data: Row[], filename = "export") {
  triggerDownload(toCSV(data), `${filename}.csv`, "text/csv;charset=utf-8;")
}

/** Download data as a JSON file */
export function exportJSON(data: Row[], filename = "export") {
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, "application/json")
}

/** Timestamp suffix for unique filenames e.g. "2025-07-20_14-32" */
export function fileTimestamp(): string {
  return new Date()
    .toISOString()
    .replace("T", "_")
    .replace(/:/g, "-")
    .slice(0, 16)
}
