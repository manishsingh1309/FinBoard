"use client"

import useSWR from "swr"
import Link from "next/link"
import { useMemo, useEffect, useState } from "react"
import { useDashboardStore } from "@/store/dashboard-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Chart.js
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, CategoryScale, ChartTooltip, Legend, Filler)

const fetcher = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data?.error || r.statusText)
    return data
  })

// Recognize Finnhub candles and normalize alongside Alpha Vantage
function extractTimeSeries(obj: any) {
  console.log("Extracting time series from:", obj)
  
  if (!obj || typeof obj !== "object") {
    console.log("No valid object received")
    return null
  }
  
  // Check for Finnhub error status
  if (obj.s === "no_data") {
    console.log("Finnhub returned no_data status")
    return null
  }
  
  // Check for Alpha Vantage Global Quote format
  if (obj["Global Quote"]) {
    console.log("Found Alpha Vantage Global Quote format")
    const quote = obj["Global Quote"]
    const date = quote["07. latest trading day"] || new Date().toISOString().slice(0, 10)
    const open = parseFloat(quote["02. open"])
    const high = parseFloat(quote["03. high"])
    const low = parseFloat(quote["04. low"])
    const close = parseFloat(quote["05. price"])
    const prevClose = parseFloat(quote["08. previous close"])
    const volume = parseFloat(quote["06. volume"])
    
    // Create simulated intraday data points
    return {
      type: "alphavantage",
      rows: [
        {
          date: date + " 09:30",
          open: prevClose,
          high: prevClose,
          low: prevClose,
          close: open,
          volume: undefined,
        },
        {
          date: date + " 11:00",
          open: open,
          high: Math.max(open, high * 0.7 + open * 0.3),
          low: Math.min(open, low * 0.7 + open * 0.3),
          close: high > open ? high * 0.6 + open * 0.4 : low * 0.6 + open * 0.4,
          volume: undefined,
        },
        {
          date: date + " 13:00",
          open: high > open ? high * 0.6 + open * 0.4 : low * 0.6 + open * 0.4,
          high: high,
          low: low,
          close: (high + low) / 2,
          volume: undefined,
        },
        {
          date: date + " 15:00",
          open: (high + low) / 2,
          high: Math.max((high + low) / 2, close * 0.6 + high * 0.2 + low * 0.2),
          low: Math.min((high + low) / 2, close * 0.6 + high * 0.2 + low * 0.2),
          close: close * 0.8 + ((high + low) / 2) * 0.2,
          volume: undefined,
        },
        {
          date: date + " 16:00",
          open: close * 0.8 + ((high + low) / 2) * 0.2,
          high: Math.max(close, close * 0.8 + ((high + low) / 2) * 0.2),
          low: Math.min(close, close * 0.8 + ((high + low) / 2) * 0.2),
          close: close,
          volume: volume,
        }
      ],
    }
  }
  
  // Check if it's a single quote response (c, d, dp, h, l, o, pc, t) - Finnhub format
  if (obj.c !== undefined && obj.t !== undefined && !Array.isArray(obj.c)) {
    console.log("Found single quote data, converting to expanded format for better visualization")
    const timestamp = obj.t * 1000
    const date = new Date(timestamp).toISOString().slice(0, 10)
    const open = Number(obj.o) || Number(obj.pc)
    const high = Number(obj.h)
    const low = Number(obj.l)
    const close = Number(obj.c)
    const prevClose = Number(obj.pc)
    
    // Create multiple data points to show intraday movement for better visualization
    // This simulates the day's trading pattern using open, high, low, close
    return {
      type: "finnhub",
      rows: [
        {
          date: date + " 09:30", // Market open
          open: prevClose,
          high: prevClose,
          low: prevClose,
          close: open,
          volume: undefined,
        },
        {
          date: date + " 11:00", // Mid-morning
          open: open,
          high: Math.max(open, high * 0.7 + open * 0.3),
          low: Math.min(open, low * 0.7 + open * 0.3),
          close: high > open ? high * 0.6 + open * 0.4 : low * 0.6 + open * 0.4,
          volume: undefined,
        },
        {
          date: date + " 13:00", // Mid-day (peak)
          open: high > open ? high * 0.6 + open * 0.4 : low * 0.6 + open * 0.4,
          high: high,
          low: low,
          close: (high + low) / 2,
          volume: undefined,
        },
        {
          date: date + " 15:00", // Afternoon
          open: (high + low) / 2,
          high: Math.max((high + low) / 2, close * 0.6 + high * 0.2 + low * 0.2),
          low: Math.min((high + low) / 2, close * 0.6 + high * 0.2 + low * 0.2),
          close: close * 0.8 + ((high + low) / 2) * 0.2,
          volume: undefined,
        },
        {
          date: date + " 16:00", // Market close
          open: close * 0.8 + ((high + low) / 2) * 0.2,
          high: Math.max(close, close * 0.8 + ((high + low) / 2) * 0.2),
          low: Math.min(close, close * 0.8 + ((high + low) / 2) * 0.2),
          close: close,
          volume: undefined,
        }
      ],
    }
  }
  
  // Finnhub candle arrays
  if (Array.isArray(obj.t) && Array.isArray(obj.c)) {
    console.log("Found Finnhub candle data with", obj.t.length, "points")
    return {
      type: "finnhub",
      rows: obj.t.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        open: Number(obj.o?.[i]),
        high: Number(obj.h?.[i]),
        low: Number(obj.l?.[i]),
        close: Number(obj.c?.[i]),
        volume: obj.v?.[i] != null ? Number(obj.v[i]) : undefined,
      })),
    }
  }
  
  // Alpha Vantage "Time Series ..."
  const key = Object.keys(obj).find((k) => k.toLowerCase().includes("time series"))
  if (key) {
    console.log("Found Alpha Vantage time series data")
  }
  return key ? { type: "av", series: obj[key] } : null
}

function mapAVSeriesToArray(series: any) {
  if (!series || typeof series !== "object") return []
  const rows = Object.keys(series).map((date) => {
    const d = series[date] || {}
    const get = (k: string) => {
      const key = Object.keys(d).find((x) => x.toLowerCase().includes(k))
      const v = key ? d[key] : undefined
      const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : Number.NaN
      return Number.isFinite(n) ? n : null
    }
    return {
      date,
      open: get("open"),
      high: get("high"),
      low: get("low"),
      close: get("close"),
      volume: get("volume"),
    }
  })
  return rows.sort((a, b) => (a.date > b.date ? 1 : -1))
}

export default function WidgetDetail({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false)
  const widget = useDashboardStore((s: any) => s.getWidget?.(id))

  useEffect(() => {
    setMounted(true)
  }, [])

  const body = widget ? { provider: widget.provider, endpoint: widget.endpoint, params: widget.params } : null
  const { data, error, isLoading, mutate } = useSWR(body ? ["/api/proxy", body] : null, ([u, b]) => fetcher(u, b), {
    refreshInterval: widget?.refreshMs ?? 60000,
    revalidateOnFocus: false,
  })

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log("Widget data received:", data)
      console.log("Widget config:", widget)
    }
  }, [data, widget])

  const { rows, latest, prev, changeAbs, changePct } = useMemo(() => {
    const ex = extractTimeSeries(data)
    let arr: any[] = []
    if (ex?.type === "finnhub" || ex?.type === "alphavantage") {
      arr = (ex.rows as any[]).sort((a, b) => (a.date > b.date ? 1 : -1))
    } else if (ex?.type === "av") {
      arr = mapAVSeriesToArray(ex.series)
    } else {
      arr = []
    }
    const last = arr[arr.length - 1]
    const secondLast = arr[arr.length - 2]
    
    // If we have quote data with d (change) and dp (change percent), use those directly
    let chAbs = null
    let chPct = null
    
    if (data && data.d !== undefined && data.dp !== undefined) {
      // Use the change values from Finnhub quote endpoint
      chAbs = Number(data.d)
      chPct = Number(data.dp)
    } else if (data?.["Global Quote"]) {
      // Use the change values from AlphaVantage Global Quote
      const quote = data["Global Quote"]
      chAbs = parseFloat(quote["09. change"])
      chPct = parseFloat(quote["10. change percent"]?.replace("%", ""))
    } else if (last && secondLast && last.close != null && secondLast.close != null) {
      // Calculate from historical data
      chAbs = last.close - secondLast.close
      chPct = Number(((chAbs / (secondLast.close || 1)) * 100).toFixed(2))
    }
    
    return { rows: arr, latest: last, prev: secondLast, changeAbs: chAbs, changePct: chPct }
  }, [data])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!widget) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-500">Widget not found.</p>
        <Link href="/" className="text-sky-600 hover:underline text-sm">
          Back to dashboard
        </Link>
      </main>
    )
  }

  const chartData =
    rows && rows.length
      ? {
          labels: rows.map((r) => r.date),
          datasets: [
            {
              label: "Close",
              data: rows.map((r) => r.close),
              borderColor: "rgb(2, 132, 199)", // sky-600
              backgroundColor: "rgba(2, 132, 199, 0.15)",
              pointRadius: rows.length === 1 ? 8 : 4, // Larger point for single data
              pointHoverRadius: rows.length === 1 ? 10 : 6,
              pointBackgroundColor: "rgb(2, 132, 199)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              fill: true,
              tension: 0.4, // Smoother curves
              showLine: true,
            },
          ],
        }
      : undefined

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        mode: "index", 
        intersect: false,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            return `Close: $${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(120, 53, 15, 0.08)" },
        ticks: { 
          maxTicksLimit: rows && rows.length > 3 ? 6 : rows.length,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: { color: "rgba(120, 53, 15, 0.08)" },
        ticks: { 
          callback: (v: number) => `$${v.toFixed(2)}`,
        },
      },
    },
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-balance">{widget.title || widget.name}</h1>
          <p className="text-sm text-muted-foreground">{widget.provider}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => mutate()} className="hover:border-sky-600">
            Refresh
          </Button>
          <Link href="/" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:border-sky-600">
            Back
          </Link>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-500">{String((error as any)?.message || error)}</p>
            {String((error as any)?.message || "").includes("API Access Denied") ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> The free Finnhub API tier doesn't support historical chart data.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Use <strong>"Quote card"</strong> widget type instead (shows current price)</li>
                  <li>Or upgrade your Finnhub API plan at: <a href="https://finnhub.io/pricing" target="_blank" className="text-sky-600 hover:underline">finnhub.io/pricing</a></li>
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && data && (data.s === "no_data" || (!rows || rows.length === 0)) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-yellow-600">No Data Available</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No data found for symbol <strong>"{widget.params?.symbol}"</strong>. This could mean:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>The symbol doesn't exist or is misspelled</li>
              <li>The API doesn't have historical data for this symbol</li>
              <li>Try a valid stock symbol like: AAPL, MSFT, GOOGL, TSLA, AMZN</li>
            </ul>
            <div className="pt-2">
              <details className="text-sm">
                <summary className="cursor-pointer text-sky-600 hover:underline">Show API Response</summary>
                <pre className="mt-2 max-h-[200px] overflow-auto text-xs leading-5 rounded-md border p-3 bg-muted/30">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && rows && rows.length > 0 ? (
        <>
          {rows.length <= 5 && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-600">
                  ℹ️ Showing simulated intraday movement based on today's open, high, low, and close. This widget uses the <code className="bg-muted px-1 py-0.5 rounded">/quote</code> endpoint. 
                  For real historical multi-day charts, you need a paid Finnhub plan with access to the <code className="bg-muted px-1 py-0.5 rounded">/stock/candle</code> endpoint.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Top stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="bg-card">
              <CardHeader className="py-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Latest Close</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-semibold">{latest?.close ?? "—"}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader className="py-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Change</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-xl font-semibold ${(changeAbs ?? 0) >= 0 ? "text-sky-600" : "text-rose-600"}`}>
                  {changeAbs != null ? (changeAbs >= 0 ? "+" : "") + changeAbs.toFixed(2) : "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader className="py-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Change %</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-xl font-semibold ${(changePct ?? 0) >= 0 ? "text-sky-600" : "text-rose-600"}`}>
                  {changePct != null ? (changePct >= 0 ? "+" : "") + changePct.toFixed(2) + "%" : "—"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Chart / Table / Raw */}
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Price (Close) {rows && rows.length === 1 ? "- Single Point" : ""}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    {chartData ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">No chartable data.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table">
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">OHLCV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[60vh] overflow-auto">
                    <table className="w-full text-sm table-fixed">
                      <thead className="sticky top-0 bg-background">
                        <tr className="text-left">
                          <th className="px-2 py-2 font-medium">Date</th>
                          <th className="px-2 py-2 font-medium">Open</th>
                          <th className="px-2 py-2 font-medium">High</th>
                          <th className="px-2 py-2 font-medium">Low</th>
                          <th className="px-2 py-2 font-medium">Close</th>
                          <th className="px-2 py-2 font-medium">Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rows || []).slice(-200).map((r, i) => (
                          <tr key={r.date} className={`border-t ${i % 2 ? "bg-muted/30" : ""}`}>
                            <td className="px-2 py-2">{r.date}</td>
                            <td className="px-2 py-2">{r.open ?? "—"}</td>
                            <td className="px-2 py-2">{r.high ?? "—"}</td>
                            <td className="px-2 py-2">{r.low ?? "—"}</td>
                            <td className="px-2 py-2">{r.close ?? "—"}</td>
                            <td className="px-2 py-2">{r.volume ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw">
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Raw Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[70vh] overflow-auto text-xs leading-5 rounded-md border p-3">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </main>
  )
}
