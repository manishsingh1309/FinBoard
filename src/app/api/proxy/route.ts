import { type NextRequest, NextResponse } from "next/server"

type Body = {
  provider: "alphaVantage" | "finnhub"
  endpoint: string
  params?: Record<string, string>
  intent?: "preview" | "data"
}

type CacheEntry = { expires: number; data: any }

// In-memory TTL cache to soften rate limits; scoped to the serverless runtime
const cache = new Map<string, CacheEntry>()
const DEFAULT_TTL = 30_000 // 30 seconds for normal data requests
const PREVIEW_TTL = 8_000 // shorter for preview/mapper flows
const RETRY_AFTER_MS = 60_000 // pause if we detect rate limits
let rateLimitUntil = 0

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { provider, endpoint, params = {}, intent = "data" } = body

    // short-circuit if we recently hit rate limit
    if (Date.now() < rateLimitUntil) {
      return NextResponse.json({ error: "Temporarily paused due to rate limiting" }, { status: 429 })
    }

    const cacheKey = makeCacheKey(provider, endpoint, params)
    const ttl = intent === "preview" ? PREVIEW_TTL : DEFAULT_TTL
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { status: 200, headers: { "x-cache": "hit" } })
    }

    let url = ""
    const headers: HeadersInit = {}

    if (provider === "alphaVantage") {
      const key = process.env.ALPHA_VANTAGE_API_KEY
      if (!key) return NextResponse.json({ error: "Missing ALPHA_VANTAGE_API_KEY" }, { status: 500 })
      const sp = new URLSearchParams({ function: endpoint, apikey: key, ...asStringRecord(params) })
      url = `https://www.alphavantage.co/query?${sp.toString()}`
    } else if (provider === "finnhub") {
      const key = process.env.FINNHUB_API_KEY
      if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 })
      const base = "https://finnhub.io/api/v1"
      const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      const sp = new URLSearchParams({ token: key, ...asStringRecord(params) })
      url = `${base}${path}?${sp.toString()}`
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    const res = await fetch(url, { headers, next: { revalidate: 0 } })
    const status = res.status

    if (status === 429) {
      rateLimitUntil = Date.now() + RETRY_AFTER_MS
      return NextResponse.json({ error: "Rate limit exceeded", status }, { status })
    }

    if (status === 403) {
      return NextResponse.json({ 
        error: "Access denied. Your API key doesn't have permission for this endpoint. Try upgrading your Finnhub plan or use the Quote card widget instead of Chart.", 
        status 
      }, { status })
    }

    const text = await res.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text } // some endpoints could return CSV/text
    }
    
    // Check if Finnhub returned an access error in the response body
    if (data && data.error && data.error.includes("don't have access")) {
      return NextResponse.json({ 
        error: "API Access Denied: Your Finnhub API key doesn't support historical candle data. This feature requires a paid Finnhub plan. Try using Quote card widgets instead, which show current price only.",
        finnhubError: data.error
      }, { status: 403 })
    }
    
    cache.set(cacheKey, { data, expires: Date.now() + ttl })
    return NextResponse.json(data, { status: 200, headers: { "x-cache": "miss" } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}

function makeCacheKey(provider: string, endpoint: string, params: Record<string, string>) {
  const sp = new URLSearchParams(params)
  return `${provider}|${endpoint}|${sp.toString()}`
}

function asStringRecord(obj: Record<string, any>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]))
}
