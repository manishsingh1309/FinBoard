"use client"

import useSWR from "swr"
import type { WidgetCard } from "@/types/widgets"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { adaptFinnhubQuote } from "@/services/adapters"

export function CardWidget({ widget }: { widget: WidgetCard }) {
  const { data, error, isLoading } = useSWR(
    ["widget", widget.id, widget.provider, widget.endpoint, widget.params],
    async () => {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: widget.provider,
          endpoint: widget.endpoint,
          params: widget.params,
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.status === 429 || json?.code === 429) {
        const err: any = new Error(json?.message || json?.error || "Rate limited")
        err.code = json?.code || json?.status
        throw err
      }
      return json
    },
    { refreshInterval: widget.refreshMs, dedupingInterval: 5_000 },
  )

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading
      </div>
    )
  if ((error as any)?.code === 429) return <div className="text-sm text-destructive">Rate limited — please retry</div>
  if (error) return <div className="text-sm text-destructive">Error loading</div>
  if (!data) return <div className="text-sm text-muted-foreground">No data</div>

  const quote = adaptFinnhubQuote(data)?.[0]
  const current = Number(quote?.close ?? data?.c ?? data?.price)
  const prevClose = Number(data?.pc ?? data?.previousClose ?? quote?.open ?? current)
  const change = Number.isFinite(current) && Number.isFinite(prevClose) ? current - prevClose : Number.NaN
  const percent = Number.isFinite(change) && Number.isFinite(prevClose) && prevClose !== 0 ? (change / prevClose) * 100 : data?.dp
  const isUp = Number.isFinite(percent) ? percent >= 0 : change >= 0

  const priceDisplay = Number.isFinite(current)
    ? current.toLocaleString(undefined, { style: "currency", currency: "USD" })
    : "—"
  const percentDisplay = Number.isFinite(percent)
    ? `${percent.toFixed(2)}%`
    : Number.isFinite(change) && Number.isFinite(prevClose)
      ? `${((change / prevClose) * 100).toFixed(2)}%`
      : "—"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="space-y-1 min-w-0">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground truncate">{widget.params?.symbol || widget.name}</p>
        <p className="text-2xl font-semibold text-[color:var(--color-card-foreground)] leading-tight">{priceDisplay}</p>
      </div>
      <div
        className={
          "inline-flex items-center justify-end gap-1 rounded-full px-3 py-1.5 text-sm font-medium shadow-[0_12px_32px_-20px_rgba(0,0,0,0.6)] " +
          (isUp ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400")
        }
      >
        {isUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        <span className="tabular-nums">{percentDisplay}</span>
      </div>
    </div>
  )
}

export { CardWidget as CardWidgetV2 }
