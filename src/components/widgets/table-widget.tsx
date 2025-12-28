"use client"

import useSWR from "swr"
import { getArrayFromData, getByPath } from "@/utils/json"
import type { WidgetTable } from "@/types/widgets"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

export function TableWidget({ widget }: { widget: WidgetTable }) {
  const { data, error, isLoading } = useSWR(
    ["widget", widget.id, widget.provider, widget.endpoint, widget.params],
    () =>
      fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: widget.provider,
          endpoint: widget.endpoint,
          params: widget.params,
        }),
      }).then((r) => r.json()),
    { refreshInterval: widget.refreshMs, dedupingInterval: 5_000 },
  )

  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const arr = getArrayFromData(data)
    if (!arr) return []
    const filtered = query
      ? arr.filter((row: any) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
      : arr
    return filtered.slice(0, 50)
  }, [data, query])

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading
      </div>
    )
  if (error) return <div className="text-sm text-destructive">Error loading</div>
  if (!data) return <div className="text-sm text-muted-foreground">No data</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <Input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground">
              {widget.mapping.columns.map((c) => (
                <th key={c} className="text-left font-medium px-2 py-1">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx: number) => (
              <tr key={idx} className="border-t">
                {widget.mapping.columns.map((c) => (
                  <td key={c} className="px-2 py-1">
                    {String(getByPath(row, c) ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableWidget
