"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardStore } from "@/store/dashboard-store"
import type { WidgetType } from "@/types/widgets"

type Props = { open: boolean; onOpenChange: (v: boolean) => void }

const ONE_DAY = 86_400

function candleWindow(days: number) {
  const now = Math.floor(Date.now() / 1000)
  return { from: now - days * ONE_DAY, to: now }
}

export function AddWidgetDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("")
  const [type, setType] = useState<WidgetType>("card")
  const [provider, setProvider] = useState<"finnhub" | "alphaVantage" | "indian">("finnhub")
  const [symbol, setSymbol] = useState("AAPL")
  const [refreshMs, setRefreshMs] = useState(60_000)

  const addWidget = useDashboardStore((s) => s.addWidget)

  function onAdd() {
    if (!symbol.trim()) {
      alert("Please enter a symbol before adding a widget.")
      return
    }
    const title = name || `${symbol} ${type === "card" ? "Quote" : "Chart"}`

    if (type === "card") {
      addWidget({
        type,
        title,
        name: title,
        provider,
        endpoint: provider === "finnhub" ? "/quote" : provider === "alphaVantage" ? "GLOBAL_QUOTE" : "/quote",
        params: { symbol },
        refreshMs,
        mapping: { paths: ["c"], format: "currency" },
      } as any)
    } else {
      const { from, to } = candleWindow(90)
      addWidget({
        type: "line",
        title,
        name: title,
        provider,
        endpoint: provider === "finnhub" ? "/stock/candle" : provider === "alphaVantage" ? "TIME_SERIES_DAILY" : "/time_series",
        params: provider === "finnhub" 
          ? { symbol, resolution: "D", from, to }
          : provider === "alphaVantage"
          ? { symbol }
          : { symbol, interval: "1day", outputsize: 30 },
        refreshMs,
        mapping: { x: "time", y: "close" },
      } as any)
    }

    onOpenChange(false)
    setName("")
    setSymbol("AAPL")
    setProvider("finnhub")
    setRefreshMs(60_000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl rounded-2xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-popover)]/96 text-[color:var(--color-popover-foreground)] shadow-[0_50px_140px_-60px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-7 pt-7 pb-3 border-b border-[color:var(--color-border)]/40 shrink-0">
          <DialogTitle className="text-2xl font-semibold text-[color:var(--color-card-foreground)]">Add a new widget</DialogTitle>
          <p className="text-sm text-[color:var(--color-muted-foreground)]/90">Choose a widget type, symbol, and refresh rate. Your widget will appear on the dashboard immediately.</p>
        </DialogHeader>

        <div className="grid gap-4 px-7 pb-7 pt-2 overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 rounded-xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-card)]/25 p-4 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.75)]">
              <Label className="text-sm text-[color:var(--color-card-foreground)]">Data Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
                <SelectTrigger className="bg-[color:var(--color-card)]/20 border border-[color:var(--color-border)]/50 text-[color:var(--color-popover-foreground)]">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-[color:var(--color-popover)] text-[color:var(--color-popover-foreground)] border border-[color:var(--color-border)]/60">
                  <SelectItem value="finnhub">Finnhub (US Stocks)</SelectItem>
                  <SelectItem value="alphaVantage">Alpha Vantage (Global)</SelectItem>
                  <SelectItem value="indian">Indian Market (NSE/BSE)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[color:var(--color-muted-foreground)]/80">
                Choose your data source based on market coverage.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-card)]/25 p-4 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.75)]">
              <Label className="text-sm text-[color:var(--color-card-foreground)]">Widget type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WidgetType)}>
                <SelectTrigger className="bg-[color:var(--color-card)]/20 border border-[color:var(--color-border)]/50 text-[color:var(--color-popover-foreground)]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[color:var(--color-popover)] text-[color:var(--color-popover-foreground)] border border-[color:var(--color-border)]/60">
                  <SelectItem value="card">Quote card (price + change)</SelectItem>
                  <SelectItem value="line">Price chart (daily candles)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[color:var(--color-muted-foreground)]/80">
                Quote shows latest market price; chart shows historical candles.
                {type === "line" && provider === "finnhub" && (
                  <span className="block mt-1 text-yellow-500">
                    ⚠️ Chart requires paid Finnhub plan. Free tier: use Quote card.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-2 rounded-xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-card)]/25 p-4 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.75)]">
              <Label className="text-sm text-[color:var(--color-card-foreground)]">Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder={provider === "indian" ? "RELIANCE.NSE" : "AAPL"}
                className="bg-[color:var(--color-card)]/15 border border-[color:var(--color-border)]/50 text-[color:var(--color-popover-foreground)] placeholder:text-[color:var(--color-muted-foreground)]/70"
              />
              <p className="text-xs text-[color:var(--color-muted-foreground)]/80">
                {provider === "indian" 
                  ? "Format: SYMBOL.NSE or SYMBOL.BSE (e.g., RELIANCE.NSE, TCS.BSE)" 
                  : "Any ticker supported by your selected provider."}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-card)]/25 p-4 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.75)]">
            <Label className="text-sm text-[color:var(--color-card-foreground)]">Optional title</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${symbol} ${type === "card" ? "Quote" : "Chart"}`}
              className="bg-[color:var(--color-card)]/15 border border-[color:var(--color-border)]/50 text-[color:var(--color-popover-foreground)] placeholder:text-[color:var(--color-muted-foreground)]/70"
            />
            <p className="text-xs text-[color:var(--color-muted-foreground)]/80">Defaults to symbol + type if left empty.</p>
          </div>

          <div className="space-y-2 rounded-xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-card)]/25 p-4 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.75)]">
            <Label className="text-sm text-[color:var(--color-card-foreground)]">Auto refresh (seconds)</Label>
            <Input
              type="number"
              min={0}
              value={Math.floor(refreshMs / 1000)}
              onChange={(e) => setRefreshMs(Math.max(0, Number.parseInt(e.target.value || "0", 10)) * 1000)}
              className="bg-[color:var(--color-card)]/15 border border-[color:var(--color-border)]/50 text-[color:var(--color-popover-foreground)]"
            />
            <p className="text-xs text-[color:var(--color-muted-foreground)]/80">Set to 0 to disable auto-refresh; default is 60s.</p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[color:var(--color-border)]/60 text-[color:var(--color-popover-foreground)]">
              Cancel
            </Button>
            <Button onClick={onAdd} className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-[0_12px_40px_-18px_rgba(250,204,21,0.8)]">
              Add widget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
