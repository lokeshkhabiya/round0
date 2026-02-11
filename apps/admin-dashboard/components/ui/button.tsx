import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-white/10 hover:brightness-[1.02] active:brightness-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm ring-1 ring-inset ring-white/10 hover:brightness-[1.02] active:brightness-[0.98] focus-visible:ring-destructive/25 dark:focus-visible:ring-destructive/35 dark:bg-destructive/70",
        outline:
          "border border-border/70 bg-card/40 shadow-sm backdrop-blur-sm hover:bg-accent/60 hover:text-accent-foreground dark:bg-input/25 dark:border-input/60 dark:hover:bg-input/45",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost:
          "hover:bg-accent/60 hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary/70",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-xl",
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
