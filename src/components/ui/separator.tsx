export function Separator({
  orientation = "horizontal",
  className = "",
}: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={className || (orientation === "vertical" ? "w-px h-full bg-border" : "h-px w-full bg-border")}
    />
  )
}
