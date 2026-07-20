/** Parse numeric suffixes from record IDs and produce the next sequential id. */

export function nextIdSuffix(ids: readonly string[], pattern: RegExp): number {
  const nums = ids.map(id => {
    const m = pattern.exec(id)
    return m ? Number(m[1]) : NaN
  }).filter(n => !Number.isNaN(n))
  return (nums.length ? Math.max(...nums) : 0) + 1
}

export function formatId(prefix: string, num: number, pad = 3): string {
  return `${prefix}${String(num).padStart(pad, "0")}`
}

export function nextRecordId(ids: readonly string[], pattern: RegExp, prefix: string, pad = 3): string {
  return formatId(prefix, nextIdSuffix(ids, pattern), pad)
}
