import { describe, expect, it, beforeEach, vi } from "vitest"
import { useDashboardStore } from "./dashboard-store"

// helper to reset store between tests
function resetStore() {
  const { widgets, hasSeenTour } = useDashboardStore.getState()
  if (widgets.length || hasSeenTour) {
    useDashboardStore.setState({ widgets: [], hasSeenTour: false })
  }
}

describe("dashboard store", () => {
  beforeEach(() => {
    // freeze time so IDs are predictable
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"))
    resetStore()
  })

  it("adds a widget with defaults", () => {
    useDashboardStore.getState().addWidget({
      type: "card",
      name: "Test",
      provider: "finnhub",
      endpoint: "/quote",
      params: { symbol: "AAPL" },
      refreshMs: 1000,
      mapping: { paths: ["c"], format: "currency" },
    })
    const widgets = useDashboardStore.getState().widgets
    expect(widgets).toHaveLength(1)
    expect(widgets[0].id).toBeTruthy()
    expect(widgets[0].name).toBe("Test")
    expect(widgets[0].refreshMs).toBe(1000)
  })

  it("ignores invalid reorder indices", () => {
    useDashboardStore.getState().addWidget({
      type: "card",
      name: "One",
      provider: "finnhub",
      endpoint: "/quote",
      params: {},
      refreshMs: 1000,
      mapping: { paths: ["c"], format: "currency" },
    })
    useDashboardStore.getState().addWidget({
      type: "card",
      name: "Two",
      provider: "finnhub",
      endpoint: "/quote",
      params: {},
      refreshMs: 1000,
      mapping: { paths: ["c"], format: "currency" },
    })
    const before = [...useDashboardStore.getState().widgets]
    useDashboardStore.getState().reorder(5, 1)
    expect(useDashboardStore.getState().widgets).toEqual(before)
  })

  it("exports and imports configuration", () => {
    useDashboardStore.getState().addWidget({
      type: "line",
      name: "Chart",
      provider: "finnhub",
      endpoint: "/candle",
      params: {},
      refreshMs: 2000,
      mapping: { x: "t", y: "c" },
    })
    const exportData = useDashboardStore.getState().exportConfig()
    expect(exportData.version).toBe(1)
    expect(exportData.widgets).toHaveLength(1)

  // wipe and re-import
  useDashboardStore.setState({ widgets: [] })
    useDashboardStore.getState().importConfig(exportData)
    expect(useDashboardStore.getState().widgets).toHaveLength(1)
    expect(useDashboardStore.getState().widgets[0].name).toBe("Chart")
  })
})
