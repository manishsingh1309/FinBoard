"use client"

import useSWR from "swr"
import type { WidgetLine } from "@/types/widgets"
import { toTimeSeries } from "@/utils/json"
import { Loader2 } from "lucide-react"
import { adaptFinnhubCandle } from "@/services/adapters"

// Chart.js + react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export function LineChartWidget({ widget }: { widget: WidgetLine }) {
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
  if (data?.status === 429 || data?.code === 429) return <div className="text-sm text-destructive">Rate limited — please retry</div>
  if (data?.s === "no_data") return <div className="text-sm text-muted-foreground">No candle data for this range</div>

  const normalized = adaptFinnhubCandle(data)
  const series = (normalized.length ? normalized : toTimeSeries(data, widget.mapping.x, widget.mapping.y))
    .slice(0, 200)
    .reverse()
  if (!series.length) return <div className="text-sm text-muted-foreground">No data</div>
  const labels = series.map((d) => String(d.time))
  const values = series.map((d: any) => Number((d as any).value ?? (d as any).close ?? 0))

  const chartData = {
    labels,
    datasets: [
      {
        label: widget.name || "Series",
        data: values,
        borderColor: "#0284c7", // sky-600
        backgroundColor: "rgba(2,132,199,0.15)",
        pointRadius: 0,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false, mode: "index" as const },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
      y: { grid: { color: "rgba(124,63,0,0.08)" } }, // subtle brown grid
    },
  }

  return (
    <div className="h-56">
      <Line data={chartData} options={options} />
    </div>
  )
}
