// Utilities for JSON path access and mapping for common finance API shapes

import type { FieldFormat } from "@/types/widgets"

export function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined
  return path.split(".").reduce((acc: any, key) => {
    if (acc == null) return undefined
    if (Array.isArray(acc)) {
      const idx = Number(key)
      return isNaN(idx) ? undefined : acc[idx]
    }
    return acc[key]
  }, obj)
}

export function formatField(v: any, format: FieldFormat): string {
  if (v == null || v === "") return "-"
  const num = Number(v)
  if (!isNaN(num)) {
    if (format === "currency") return num.toLocaleString(undefined, { style: "currency", currency: "USD" })
    if (format === "percent")
      return (num / 100).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 })
    return num.toLocaleString()
  }
  return String(v)
}

// Try to detect an array from a response for table display
export function getArrayFromData(data: any): any[] | null {
  if (!data) return null
  if (Array.isArray(data)) return data
  // Alpha Vantage "bestMatches" (symbol search)
  if (Array.isArray(data.bestMatches)) return data.bestMatches
  // Alpha Vantage time series objects -> convert to array of records
  const seriesKey = Object.keys(data).find((k) => k.toLowerCase().includes("time series"))
  if (seriesKey && data[seriesKey]) {
    const obj = data[seriesKey]
    const rows = Object.entries<any>(obj).map(([time, ohlc]) => ({
      time,
      ...normalizeOHLC(ohlc),
    }))
    return rows
  }
  // Finnhub search result
  if (Array.isArray(data.result)) return data.result
  // Generic: first array value inside object
  for (const v of Object.values(data)) {
    if (Array.isArray(v)) return v
  }
  return null
}

function normalizeOHLC(ohlc: any) {
  // Handle keys like "1. open", "2. high" or plain "open"
  const get = (keys: string[]) => {
    for (const k of keys) {
      if (ohlc[k] != null) return Number(ohlc[k])
    }
    return undefined
  }
  return {
    open: get(["1. open", "open", "o"]),
    high: get(["2. high", "high", "h"]),
    low: get(["3. low", "low", "l"]),
    close: get(["4. close", "close", "c"]),
    volume: get(["5. volume", "volume", "v"]),
  }
}

export function toTimeSeries(data: any, xPath: string, yPath: string) {
  // Finnhub candles: { t:[unix], o:[], h:[], l:[], c:[], v:[], s:"ok" }
  if (data && Array.isArray(data?.t) && Array.isArray(data?.c)) {
    const t: number[] = data.t
    const o: any[] = data.o || []
    const h: any[] = data.h || []
    const l: any[] = data.l || []
    const c: any[] = data.c || []
    const v: any[] = data.v || []
    const pick = (row: any, key: string) => {
      const k = (key || "").toLowerCase()
      if (k.includes("open")) return row.open
      if (k.includes("high")) return row.high
      if (k.includes("low")) return row.low
      if (k.includes("volume") || k === "v") return row.volume
      // default to close
      return row.close
    }
    const rows = t.map((ts, i) => {
      const row = {
        time: new Date(ts * 1000).toISOString().slice(0, 10), // YYYY-MM-DD
        open: Number(o[i]),
        high: Number(h[i]),
        low: Number(l[i]),
        close: Number(c[i]),
        volume: v[i] != null ? Number(v[i]) : undefined,
      }
      return { time: String(row.time), value: Number(pick(row, yPath)) }
    })
    return rows.filter((r) => r.time && Number.isFinite(r.value))
  }

  // Finnhub /quote -> single datapoint { o,h,l,c,t }
  if (data && typeof data === "object" && ["o", "h", "l", "c"].every((k) => k in data)) {
    const ts = Number.isFinite(Number(data.t)) ? Number(data.t) * 1000 : Date.now()
    const row = {
      time: new Date(ts).toISOString(),
      open: Number(data.o),
      high: Number(data.h),
      low: Number(data.l),
      close: Number(data.c),
      volume: Number(data.v ?? Number.NaN),
    }
    const pick = (key: string) => {
      const k = (key || "").toLowerCase()
      if (k.includes("open")) return row.open
      if (k.includes("high")) return row.high
      if (k.includes("low")) return row.low
      if (k.includes("volume") || k === "v") return row.volume
      return row.close
    }
    return [{ time: row.time, value: Number(pick(yPath)) }].filter((r) => Number.isFinite(r.value))
  }

  // Special-case Alpha Vantage time series
  const seriesKey = data && Object.keys(data).find((k) => k.toLowerCase().includes("time series"))
  if (seriesKey) {
    const obj = data[seriesKey]
    const rows = Object.entries<any>(obj).map(([time, ohlc]) => ({
      time,
      value: Number(getByPath(normalizeOHLC(ohlc), yPath) ?? getByPath(ohlc, yPath)),
    }))
    return rows.filter((r) => r.value != null && !isNaN(r.value))
  }

  // Generic: if array present try mapping
  const arr = getArrayFromData(data)
  if (arr) {
    return arr
      .map((row: any) => ({ time: String(getByPath(row, xPath)), value: Number(getByPath(row, yPath)) }))
      .filter((r) => r.time && r.value != null && !isNaN(r.value))
  }

  return []
}
