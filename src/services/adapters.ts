export type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number }

function isFiniteNum(n: any) {
  const v = typeof n === "string" ? Number.parseFloat(n) : n
  return typeof v === "number" && Number.isFinite(v)
}

// Alpha Vantage GLOBAL_QUOTE -> single quote snapshot
export function adaptAlphaVantageGlobalQuote(json: any): Candle[] {
  const quote = json?.["Global Quote"]
  if (!quote || typeof quote !== "object") return []

  const o = quote["02. open"]
  const h = quote["03. high"]
  const l = quote["04. low"]
  const c = quote["05. price"]
  const v = quote["06. volume"]
  const tradingDay = quote["07. latest trading day"]

  if (!isFiniteNum(o) || !isFiniteNum(h) || !isFiniteNum(l) || !isFiniteNum(c)) return []

  const t = tradingDay ? Date.parse(tradingDay) : Date.now()
  if (!Number.isFinite(t)) return []

  return [{
    time: Math.floor(t / 1000),
    open: +o,
    high: +h,
    low: +l,
    close: +c,
    volume: isFiniteNum(v) ? +v : undefined
  }]
}

// Alpha Vantage TIME_SERIES_DAILY or similar object map keyed by date
export function adaptAlphaVantageDaily(json: any): Candle[] {
  const series =
    json?.["Time Series (Daily)"] ||
    json?.["Time Series (Digital Currency Daily)"] ||
    json?.["Time Series (5min)"] ||
    json?.["Time Series (60min)"] ||
    json?.["Weekly Time Series"] ||
    json?.["Monthly Time Series"]

  if (!series || typeof series !== "object") return []

  const rows: Candle[] = Object.keys(series)
    .map((date) => {
      const row = series[date]
      // keys may be "1. open" etc.
      const o = row?.["1. open"] ?? row?.open
      const h = row?.["2. high"] ?? row?.high
      const l = row?.["3. low"] ?? row?.low
      const c = row?.["4. close"] ?? row?.close
      const v = row?.["5. volume"] ?? row?.volume
      const t = Date.parse(date)
      if (!isFiniteNum(o) || !isFiniteNum(h) || !isFiniteNum(l) || !isFiniteNum(c) || !Number.isFinite(t)) return null
      return { time: t / 1000, open: +o, high: +h, low: +l, close: +c, volume: isFiniteNum(v) ? +v : undefined }
    })
    .filter(Boolean) as Candle[]

  // chronological
  return rows.sort((a, b) => a.time - b.time)
}

// Finnhub /stock/candle -> { t:[], o:[], h:[], l:[], c:[], v:[], s:"ok" }
export function adaptFinnhubCandle(json: any): Candle[] {
  const { t, o, h, l, c, v } = json || {}
  if (!Array.isArray(t) || !Array.isArray(o) || !Array.isArray(h) || !Array.isArray(l) || !Array.isArray(c)) return []
  const rows: Candle[] = t
    .map((ts: number, i: number) => {
      const open = o[i],
        high = h[i],
        low = l[i],
        close = c[i]
      const volume = Array.isArray(v) ? v[i] : undefined
      if (!isFiniteNum(open) || !isFiniteNum(high) || !isFiniteNum(low) || !isFiniteNum(close)) return null
      return {
        time: ts,
        open: +open,
        high: +high,
        low: +low,
        close: +close,
        volume: isFiniteNum(volume) ? +volume : undefined,
      }
    })
    .filter(Boolean) as Candle[]
  return rows.sort((a, b) => a.time - b.time)
}

// Finnhub /quote -> { c, h, l, o, pc, t }
export function adaptFinnhubQuote(json: any): Candle[] {
  const { c, h, l, o, t } = json || {}
  if (!isFiniteNum(o) || !isFiniteNum(h) || !isFiniteNum(l) || !isFiniteNum(c)) return []
  const ts = Number.isFinite(+t) ? +t : Math.floor(Date.now() / 1000)
  return [{ time: ts, open: +o, high: +h, low: +l, close: +c }]
}

export function normalizeFrom(provider: string, endpoint: string, json: any): Candle[] {
  const p = (provider || "").toLowerCase()
  if (p === "finnhub") {
    if (endpoint.includes("/stock/candle")) return adaptFinnhubCandle(json)
    if (endpoint.includes("/quote")) return adaptFinnhubQuote(json)
  }
  // Alpha Vantage
  if (p === "alphavantage") {
    // Check for Global Quote first
    if (json?.["Global Quote"]) {
      return adaptAlphaVantageGlobalQuote(json)
    }
    // Fall back to time series
    return adaptAlphaVantageDaily(json)
  }
  // default try Alpha Vantage
  return adaptAlphaVantageDaily(json)
}
