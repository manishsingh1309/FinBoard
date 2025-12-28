"use client"

import { useDashboardStore } from "@/store/dashboard-store"
import { CardWidgetV2 } from "./card-widget"
import ChartJsWidget from "./chartjs-widget"
import TableWidget from "./table-widget"
import Link from "next/link"

export default function WidgetGrid() {
  const widgets = useDashboardStore((s) => s.widgets ?? [])

  if (!widgets.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No widgets yet</p>
        <Link
          href="#add-widget"
          className="mt-3 inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700"
        >
          Add Widget
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map((w: any) => {
        if (w.type === "table") {
          return <TableWidget key={w.id} {...w} />
        }
        if (w.type === "chartjs") {
          return (
            <ChartJsWidget
              key={w.id}
              id={w.id}
              title={w.title}
              endpoint={w.config?.endpoint}
              refreshMs={w.config?.refreshMs ?? 30000}
              chartType={w.config?.chartType ?? "line"}
              xField={w.config?.xField ?? "date"}
              yFields={w.config?.yFields ?? ["value"]}
              request={w.config?.request}
            />
          )
        }
        // default: card widget
        return <CardWidgetV2 key={w.id} widget={w} />
      })}
    </div>
  )
}
