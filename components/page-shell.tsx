import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <section className={cn("page-shell", className)}>
      <div className="page-shell-glow" />
      <div className="relative z-10 space-y-10">{children}</div>
    </section>
  )
}

