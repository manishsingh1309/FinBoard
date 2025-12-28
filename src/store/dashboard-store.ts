"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Widget, DashboardExport, WidgetCard, WidgetLine, WidgetTable } from "@/types/widgets"

type NewWidget = Omit<Widget, "id"> & { title?: string }

// add hasSeenTour state and setter to persist onboarding status
type State = {
  widgets: Widget[]
  addWidget: (w: NewWidget) => void
  removeWidget: (id: string) => void
  reorder: (from: number, to: number) => void
  exportConfig: () => DashboardExport
  importConfig: (data: DashboardExport) => void
  hasSeenTour: boolean
  setHasSeenTour: (v: boolean) => void
  getWidget: (id: string) => Widget | undefined
}

export const useDashboardStore = create<State>()(
  persist(
    (set, get) => ({
      // initialize onboarding flag
      hasSeenTour: false,
      setHasSeenTour: (v) => set(() => ({ hasSeenTour: v })),
      widgets: [],
      addWidget: (w) =>
        set((state) => {
          const title = w.title || w.name || "Untitled Widget"
          const common = {
            id: Date.now().toString(),
            title,
            name: w.name || title,
            provider: w.provider,
            endpoint: w.endpoint,
            params: w.params ?? {},
            refreshMs: w.refreshMs ?? 60000,
          }

          let widget: Widget
          if (w.type === "card") {
            widget = { ...common, type: "card", mapping: (w as WidgetCard).mapping }
          } else if (w.type === "table") {
            widget = { ...common, type: "table", mapping: (w as WidgetTable).mapping }
          } else {
            widget = { ...common, type: "line", mapping: (w as WidgetLine).mapping }
          }

          return { widgets: [...state.widgets, widget] }
        }),
      removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter((widget) => widget.id !== id) })),
      reorder: (from, to) => {
        const widgets = get().widgets
        if (from === to || from < 0 || to < 0 || from >= widgets.length || to >= widgets.length) return
        const reordered = [...widgets]
        const [item] = reordered.splice(from, 1)
        reordered.splice(to, 0, item)
        set({ widgets: reordered })
      },
      exportConfig: () => {
        const widgets = get().widgets
        return { version: 1 as const, widgets }
      },
      importConfig: (data) => {
        const incoming = (data?.widgets as Widget[]) || []
        set({ widgets: incoming })
      },
      getWidget: (id: string) => get().widgets.find((w) => w.id === id),
    }),
    {
      name: "finboard-dashboard",
      storage: typeof window !== "undefined" ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
)

export const useAppStore = useDashboardStore
export default useDashboardStore
