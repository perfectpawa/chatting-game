import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#b7bdf8] text-[#cad3f5] shadow-xs hover:bg-[#cad3f5] hover:text-[#24273a]",
        destructive:
          "bg-[#ed8796] text-[#cad3f5] shadow-xs hover:bg-[#f5bde6] hover:text-[#24273a] focus-visible:ring-[#ed8796]/20 dark:focus-visible:ring-[#ed8796]/40 dark:bg-[#ed8796]/60",
        outline:
          "border bg-[#494d64] text-[#cad3f5] shadow-xs hover:bg-[#b8c0e0] hover:text-[#24273a] dark:bg-[#363a4f] dark:border-[#494d64] dark:hover:bg-[#a5adcb] dark:hover:text-[#181926]",
        secondary:
          "bg-[#b8c0e0] text-[#cad3f5] shadow-xs hover:bg-[#cad3f5] hover:text-[#24273a]",
        ghost:
          "hover:bg-[#b7bdf8]/50 hover:text-[#cad3f5] dark:hover:bg-[#b7bdf8]/30",
        link: "text-[#cad3f5] underline-offset-4 hover:underline hover:text-[#b7bdf8]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
