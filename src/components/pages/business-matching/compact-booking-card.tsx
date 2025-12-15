import * as React from "react"
import { cn } from "@/lib/utils"

function CompactCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-none flex flex-col overflow-hidden h-full",
        className
      )}
      {...props}
    />
  )
}

function CompactCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1 p-2 bg-muted/20 shrink-0", className)}
      {...props}
    />
  )
}

function CompactCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-none tracking-tight text-sm", className)}
      {...props}
    />
  )
}

function CompactCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-2 pt-0 flex-1 grid gap-1", className)} {...props} />
  )
}

function CompactCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-2 pt-0 shrink-0", className)}
      {...props}
    />
  )
}

export { CompactCard, CompactCardHeader, CompactCardFooter, CompactCardTitle, CompactCardContent }
