"use client"

import { useState } from "react"
import { cn } from "@/utils/cn"

function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v)
}

export function JSONExplorer({
  data,
  onPickPath,
  basePath = "",
  depth = 0,
}: {
  data: any
  onPickPath: (path: string) => void
  basePath?: string
  depth?: number
}) {
  if (!isObject(data) && !Array.isArray(data)) {
    return (
      <div className="text-xs">
        <span className="text-muted-foreground">({typeof data})</span> {String(data)}
      </div>
    )
  }
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v]) : Object.entries(data)
  return (
    <ul className="text-xs">
      {entries.map(([key, value]) => (
        <JSONNode
          key={key}
          k={key as string}
          v={value}
          onPickPath={onPickPath}
          path={basePath ? `${basePath}.${key}` : (key as string)}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function JSONNode({
  k,
  v,
  path,
  onPickPath,
  depth,
}: {
  k: string
  v: any
  path: string
  onPickPath: (path: string) => void
  depth: number
}) {
  const [open, setOpen] = useState(depth < 2)
  const objectLike = v && typeof v === "object"
  return (
    <li className="py-0.5">
      <div className="flex items-center gap-2">
        {objectLike ? (
          <button className="text-muted-foreground hover:underline cursor-pointer" onClick={() => setOpen((s) => !s)}>
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block w-3" />
        )}
        <button
          className={cn("rounded px-1 hover:bg-muted cursor-pointer", objectLike ? "font-medium" : "text-foreground")}
          onClick={() => onPickPath(path)}
          title={`Pick path: ${path}`}
        >
          {k}
        </button>
        {!objectLike && <span className="text-muted-foreground">: {String(v)}</span>}
      </div>
      {open && objectLike && (
        <div className="pl-5 border-l ml-1">
          <JSONExplorer data={v} onPickPath={onPickPath} basePath={path} depth={depth + 1} />
        </div>
      )}
    </li>
  )
}
