"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { JSONExplorer } from "@/components/json-explorer"
import { Badge } from "@/components/ui/badge"

export type MapperSelection = {
  valuePath?: string
  xPath?: string
  yPath?: string
}

type Props = {
  provider: "alphaVantage" | "finnhub"
  endpoint: string
  params: Record<string, any>
  mode: "card" | "line"
  onSelect: (sel: MapperSelection) => void
}

export function MapperPanel({ provider, endpoint, params, mode, onSelect }: Props) {
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picked, setPicked] = useState<MapperSelection>({})

  async function fetchPreview() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, endpoint, params, intent: "preview" }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
      const json = await res.json()
      setPreview(json)
    } catch (e: any) {
      setError(e?.message || "Failed to fetch preview")
    } finally {
      setLoading(false)
    }
  }

  function handlePick(path: string) {
    if (mode === "card") {
      const next = { ...picked, valuePath: path }
      setPicked(next)
      onSelect(next)
    } else {
      // map path to y; keep x fixed at time unless user chooses otherwise
      const next = { ...picked, yPath: path, xPath: picked.xPath || "time" }
      setPicked(next)
      onSelect(next)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-50/5 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-100">Preview & map fields</p>
          <p className="text-xs text-white/70">Fetch sample data, then click a field to bind it.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchPreview} disabled={loading} className="border-amber-200/40">
          {loading ? "Loading..." : "Fetch"}
        </Button>
      </div>

      {error ? <p className="text-xs text-amber-200">{error}</p> : null}
      {preview ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
            <Badge variant="outline" className="border-amber-200/40 text-amber-50 bg-amber-50/10">
              Provider: {provider}
            </Badge>
            <Badge variant="outline" className="border-amber-200/40 text-amber-50 bg-amber-50/10">
              Endpoint: {endpoint}
            </Badge>
            {picked.valuePath ? <span>Value: {picked.valuePath}</span> : null}
            {mode === "line" && picked.yPath ? <span>Y: {picked.yPath}</span> : null}
          </div>
          <div className="max-h-64 overflow-auto rounded-lg border border-amber-200/20 bg-black/40 p-3">
            <JSONExplorer data={preview} onPickPath={handlePick} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-white/60">No preview yet. Fetch to inspect and map paths.</p>
      )}
    </div>
  )
}
