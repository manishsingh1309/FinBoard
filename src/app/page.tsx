"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/store/dashboard-store"
import { DashboardHeader } from "@/components/header"
import { AddWidgetDialog } from "@/components/add-widget-dialog"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { WidgetShell } from "@/components/widgets/widget-shell"
import { CardWidget } from "@/components/widgets/card-widget"
import { LineChartWidget } from "@/components/widgets/line-chart-widget"
import { cn } from "@/utils/cn"
import { Activity, ArrowRight, LineChart } from "lucide-react"

function useThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "dark"
    return localStorage.getItem("finboard-theme") || "dark"
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
    localStorage.setItem("finboard-theme", theme)
  }, [theme])
  return { theme, setTheme }
}

export default function Page() {
  const { theme, setTheme } = useThemeToggle()
  const widgets = useDashboardStore((s) => s.widgets || [])
  const reorder = useDashboardStore((s) => s.reorder)
  const removeWidget = useDashboardStore((s) => s.removeWidget)
  const [isAddOpen, setAddOpen] = useState(false)

  const providerCount = new Set(widgets.map((w) => w.provider)).size
  const refreshSeconds = widgets.length
    ? Math.max(5, Math.round(widgets.reduce((acc, w) => acc + w.refreshMs, 0) / widgets.length / 1000))
    : 60

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = widgets.findIndex((w) => w.id === active.id)
    const newIndex = widgets.findIndex((w) => w.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorder(oldIndex, newIndex)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 finboard-spotlight" aria-hidden />
      <div className="pointer-events-none absolute inset-0 finboard-blur" aria-hidden />

      <DashboardHeader theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onAddWidget={() => setAddOpen(true)} />
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10 space-y-8">
        <div className="finboard-shell p-6 sm:p-8 lg:p-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center relative">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/80">
                <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" aria-hidden />
                Realtime-ready workspace
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-balance text-foreground">
                  Command your finance dashboard with live, modular widgets.
                </h1>
                <p className="text-base sm:text-lg text-foreground/80 max-w-2xl">
                  Plug into Finnhub, fetch quotes and daily candles, and assemble widgets that stay in sync. Drag, drop,
                  and remix insights without touching a backend.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setAddOpen(true)} className="finboard-focus shadow-[0_18px_60px_-24px_rgba(6,182,212,0.65)]">
                  Launch Builder
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" asChild className="finboard-focus bg-muted/50">
                  <a href="/docs">Read the docs</a>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                <StatTile label="Active widgets" value={`${widgets.length || 0}`} helper="Drag to reorder" icon={<Activity className="size-4" />} />
                <StatTile label="Providers" value={`${providerCount || 1}`} helper="Finnhub (extensible)" icon={<LineChart className="size-4" />} />
                <StatTile label="Auto-refresh" value={`${refreshSeconds}s`} helper="Configurable per widget" icon={<ArrowRight className="size-4" />} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-amber-400/25 via-amber-300/15 to-yellow-400/20 dark:from-amber-400/25 dark:via-amber-300/15 dark:to-yellow-400/20" aria-hidden />
              <div className="relative finboard-card border-amber-200/20 bg-amber-50/80 dark:bg-amber-50/5 dark:border-amber-200/10 p-6 sm:p-7 shadow-[0_30px_120px_-70px_rgba(250,204,21,0.55)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 flex items-center justify-center text-slate-950 font-semibold shadow-lg">
                    FX
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Preview</p>
                    <p className="text-sm text-foreground/80">Live widget assembly</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden />
                    Drag-and-drop grid powered by dnd-kit
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" aria-hidden />
                    Finnhub quotes and candles via proxy
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-200" aria-hidden />
                    Persisted locally (no export/import)
                  </div>
                  <div className="rounded-xl border border-amber-200/20 bg-black/10 dark:bg-black/30 dark:border-amber-200/15 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-2">Live snapshot</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-foreground/60">AAPL • Quote</p>
                        <p className="text-2xl font-semibold text-foreground">+1.42%</p>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-200 text-xs">
                        <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-300" aria-hidden />
                        Auto-refresh in {refreshSeconds}s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="finboard-shell p-4 sm:p-6 lg:p-8 space-y-6 border border-border bg-card/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Board</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Your widgets</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="bg-muted/50">
                Add widget
              </Button>
            </div>
          </div>

          {widgets.length === 0 ? (
            <div className="finboard-card border-dashed border-amber-200/30 bg-amber-50/30 dark:bg-amber-50/5 dark:border-amber-200/20 p-8 sm:p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/30 via-amber-300/20 to-yellow-400/30 text-foreground">
                <LineChart className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No widgets yet</h3>
              <p className="text-foreground/70 max-w-xl mx-auto mb-6">
                Start by adding a quote card or price chart. Configure symbol and refresh cadence—then drag to craft your
                layout.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => setAddOpen(true)}>Create your first widget</Button>
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
                <div className="finboard-grid">
                  {widgets.map((w) => (
                    <SortableItem key={w.id} id={w.id}>
                      <WidgetShell widget={w} onRemove={() => removeWidget(w.id)}>
                        {w.type === "card" && <CardWidget widget={w} />}
                        {w.type === "line" && <LineChartWidget widget={w} />}
                      </WidgetShell>
                    </SortableItem>
                  ))}
                  <div
                    className="finboard-card border-dashed border-2 border-amber-200/30 bg-amber-50/5 hover:border-amber-300/70 hover:shadow-[0_18px_48px_-28px_rgba(250,204,21,0.6)] transition-all duration-200 group cursor-pointer"
                    onClick={() => setAddOpen(true)}
                  >
                    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[200px] text-white">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400/30 via-amber-300/20 to-yellow-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">+</span>
                      </div>
                      <h3 className="font-semibold mb-1">Add Widget</h3>
                      <p className="text-sm text-white/70">Create a new data visualization</p>
                    </div>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </section>

      <AddWidgetDialog open={isAddOpen} onOpenChange={setAddOpen} />
    </main>
  )
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("transition-all duration-200", isDragging ? "opacity-90 scale-[1.02]" : "opacity-100")}
    >
      {children}
    </div>
  )
}

function StatTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper: string
  icon: React.ReactNode
}) {
  return (
    <div className="finboard-card border-border bg-card/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-muted/50 p-2 text-foreground/80">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}
