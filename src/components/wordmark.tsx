import { cn } from '@/lib/utils'

/** The StackForge name: ink "Stack", forge-gradient "Forge" with a slow shimmer. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('select-none text-h2 tracking-tight', className)}>
      <span className="text-foreground">Stack</span>
      <span className="text-forge">Forge</span>
    </span>
  )
}

/** The square F mark from the favicon, for places too small for the name. */
export function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('bg-forge grid size-7 place-items-center rounded-lg shadow-glow', className)}
    >
      <svg viewBox="0 0 64 64" className="size-5 fill-white" aria-hidden="true">
        <path d="M22 16h22v8H31v6h11v8H31v10h-9z" />
      </svg>
    </span>
  )
}
