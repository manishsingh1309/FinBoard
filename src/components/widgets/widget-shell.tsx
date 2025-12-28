"use client"

import type { ComponentType, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Trash2, Activity, LineChart, Table2, Clock3 } from "lucide-react"
import type { Widget } from "@/types/widgets"

const providerLabel: Record<string, string> = {
  alphaVantage: "Alpha Vantage",
  finnhub: "Finnhub",
}

const typeMeta: Record<Widget["type"], { label: string; icon: ComponentType<{ className?: string }> }> = {
  card: { label: "Quote Card", icon: Activity },
  table: { label: "Data Table", icon: Table2 },
  line: { label: "Line Chart", icon: LineChart },
}

export function WidgetShell({
  widget,
  children,
  onRemove,
}: { widget: Widget; children: ReactNode; onRemove: () => void }) {
  const meta = typeMeta[widget.type]
  const Icon = meta.icon

  return (
    <Card className="finboard-card group overflow-hidden bg-[color:var(--color-card)]/60 border-[color:var(--color-border)]/40">
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-primary)]/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3 relative">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-primary)]/18 border border-[color:var(--color-border)]/50 text-[color:var(--color-primary-foreground)] shadow-inner">
            <Icon className="size-5 text-[color:var(--color-primary)]" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="finboard-text-balance text-base font-semibold text-[color:var(--color-card-foreground)]">
              {widget.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="h-6 px-2.5 border-[color:var(--color-border)]/60 text-[color:var(--color-foreground)]/80 bg-[color:var(--color-card)]/30 hover:bg-[color:var(--color-card)]/45"
              >
                {meta.label}
              </Badge>
              <Badge
                variant="outline"
                className="h-6 px-2.5 border-[color:var(--color-border)]/50 text-[color:var(--color-foreground)]/80 bg-[color:var(--color-card)]/24 hover:bg-[color:var(--color-card)]/36"
              >
                {providerLabel[widget.provider] ?? widget.provider}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[color:var(--color-muted-foreground)]">
                <Clock3 className="size-3.5" /> {Math.round(widget.refreshMs / 1000)}s refresh
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Link
            href={`/widgets/${widget.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)]/60 bg-[color:var(--color-card)]/30 hover:border-[color:var(--color-primary)]/60 px-3 py-1.5 text-xs font-medium text-[color:var(--color-foreground)]/90 hover:bg-[color:var(--color-card)]/45 finboard-focus transition-all"
            aria-label="View widget detail"
          >
            <Eye className="size-3.5" />
            <span>View</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove widget"
            className="size-9 text-[color:var(--color-muted-foreground)] hover:text-destructive hover:bg-destructive/15 finboard-focus"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-5 relative z-[1] text-[color:var(--color-foreground)]/92">{children}</CardContent>
    </Card>
  )
}
