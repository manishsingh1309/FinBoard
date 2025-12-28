import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-tight transition-all duration-150 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-[0.5px] active:scale-[0.995] shadow-[0_8px_26px_-16px_rgba(0,0,0,0.6)]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-primary)]/95 text-[color:var(--color-primary-foreground)] border border-[color:var(--color-border)]/40 hover:brightness-110",
        destructive:
          "bg-[color:var(--color-destructive)]/90 text-[color:var(--color-destructive-foreground)] shadow-sm hover:brightness-95",
        outline:
          "border border-[color:var(--color-border)]/60 bg-[color:var(--color-card)]/30 text-[color:var(--color-foreground)] backdrop-blur-sm hover:bg-[color:var(--color-card)]/45",
        secondary:
          "bg-[color:var(--color-card)]/45 text-[color:var(--color-foreground)] border border-[color:var(--color-border)]/40 hover:bg-[color:var(--color-card)]/60",
        ghost:
          "text-[color:var(--color-foreground)]/75 hover:text-[color:var(--color-foreground)] hover:bg-[color:var(--color-card)]/20",
        link: "text-[color:var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
        lg: "h-12 px-5 text-base has-[>svg]:px-4",
        icon: "size-9 rounded-md p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
