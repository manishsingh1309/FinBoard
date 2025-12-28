"use client"

import useSWR from "swr"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

type Props = {
  id: string
  title?: string
  endpoint: string // the proxied endpoint you hit via /api/proxy
  refreshMs?: number
  chartType?: "line" | "bar"
  xField: string // e.g. "time" or "date"
  yFields: string[] // e.g. ["open","close"]
  colors?: string[] // optional custom colors
  request?: Record<string, any> // body for POST to /api/proxy
}

const fetcher = async (url: string, body?: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || "Failed to fetch data")
  }
  return res.json()
}

export default function ChartJsWidget({
  id,
  title = "Chart",
  endpoint,
  refreshMs = 30_000,
  chartType = "line",
  xField,
  yFields,
  colors,
  request,
}: Props) {
  const { data, error, isLoading } = useSWR(
    ["/api/proxy", endpoint, JSON.stringify(request || {})],
    ([url, ep, body]) => fetcher(url as string, { endpoint: ep, ...(request || {}) }),
    { refreshInterval: refreshMs },
  )

  const rows: any[] = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : []
  const labels = rows.map((r) => String(r?.[xField] ?? ""))

  const palette = colors && colors.length ? colors : ["#0284c7", "#38bdf8", "#7c3f00", "#0ea5e9"] // sky and brown

  const datasets = yFields.map((k, i) => ({
    label: k,
    data: rows.map((r) => Number(r?.[k] ?? 0)),
    borderColor: palette[i % palette.length],
    backgroundColor: palette[i % palette.length],
    pointRadius: 0,
    tension: 0.35,
    borderWidth: 2,
  }))

  const chartData = { labels, datasets }
  const common = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: { x: { display: true }, y: { display: true } },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-pretty text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error: {String(error.message || error)}</div>
          ) : chartType === "bar" ? (
            <Bar data={chartData} options={common} />
          ) : (
            <Line data={chartData} options={common} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
