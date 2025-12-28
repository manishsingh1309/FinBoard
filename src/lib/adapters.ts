import { normalizeFrom } from "@/services/adapters"

export type AdapterRequest = {
  provider: "alphaVantage" | "finnhub" | "indian"
  endpoint: string
  params: Record<string, any>
}

export type AdapterMeta = {
  id: string
  label: string
  provider: AdapterRequest["provider"]
  endpoint: string
  defaultParams: Record<string, any>
  description: string
}

export const adapters: AdapterMeta[] = [
  {
    id: "finnhub-quote",
    label: "Finnhub • Quote",
    provider: "finnhub",
    endpoint: "/quote",
    defaultParams: { symbol: "AAPL" },
    description: "Latest price/ohlc snapshot for a symbol",
  },
  {
    id: "finnhub-candle",
    label: "Finnhub • Daily candles (90d)",
    provider: "finnhub",
    endpoint: "/stock/candle",
    defaultParams: { symbol: "AAPL", resolution: "D" },
    description: "Historical daily candles; provide from/to as epoch seconds",
  },
  {
    id: "av-quote",
    label: "Alpha Vantage • Global Quote",
    provider: "alphaVantage",
    endpoint: "GLOBAL_QUOTE",
    defaultParams: { symbol: "AAPL" },
    description: "Latest price/ohlc snapshot via Alpha Vantage",
  },
  {
    id: "av-daily",
    label: "Alpha Vantage • Daily Time Series",
    provider: "alphaVantage",
    endpoint: "TIME_SERIES_DAILY",
    defaultParams: { symbol: "IBM" },
    description: "Daily OHLC via Alpha Vantage",
  },
  {
    id: "indian-quote",
    label: "Indian Market • Stock Quote",
    provider: "indian",
    endpoint: "/quote",
    defaultParams: { symbol: "RELIANCE.NSE" },
    description: "Live quotes for Indian stocks (NSE/BSE)",
  },
]

export function normalizePreview(provider: string, endpoint: string, json: any) {
  return normalizeFrom(provider, endpoint, json)
}
