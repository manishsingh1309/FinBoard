"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { Moon, Sun, BookText, Plus } from "lucide-react"

export function DashboardHeader({
  theme,
  onToggleTheme,
  onAddWidget,
}: {
  theme: string
  onToggleTheme: () => void
  onAddWidget: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color:var(--color-background)]/70">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 border-b border-[color:var(--color-border)]/50">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)]/50 bg-[color:var(--color-card)]/30 px-3 py-2 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.8)]">
            <div className="h-10 w-10 rounded-lg bg-[color:var(--color-primary)]/15 border border-[color:var(--color-border)]/60 flex items-center justify-center shadow-inner">
              <div className="h-6 w-6 rounded-md bg-[color:var(--color-primary)]/90" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-lg text-[color:var(--color-card-foreground)] truncate">FinBoard</h1>
              <p className="text-xs text-[color:var(--color-muted-foreground)] truncate">Real-time finance insights</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme" className="finboard-focus bg-[color:var(--color-card)]/30 border border-[color:var(--color-border)]/40 text-[color:var(--color-foreground)]">
            {!mounted ? <span className="block size-5" aria-hidden /> : theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          <Button variant="outline" size="sm" asChild className="hidden md:inline-flex border-[color:var(--color-border)]/50 bg-[color:var(--color-card)]/20 text-[color:var(--color-foreground)]">
            <a href="/docs" aria-label="View documentation" className="gap-2">
              <BookText className="size-4" />
              <span>Docs</span>
            </a>
          </Button>

          <Separator orientation="vertical" className="h-8 hidden sm:block" />

          <Button onClick={onAddWidget} size="lg" className="finboard-focus bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:brightness-110 shadow-[0_12px_40px_-18px_rgba(250,204,21,0.8)]">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Widget</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
