import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Problem, Rel, Tech } from '../types'
import { REL, TechIcon } from './nodes'

// one per colour on the canvas; siblings sharing a colour (hosts, syncs, tracks, builds) ride along
const LEGEND: Rel[] = [
  'requires',
  'consumes',
  'queries',
  'deploys',
  'automates',
  'extends',
  'tests',
  'styles',
  'types',
  'monitors',
  'conflicts',
]

/** The wire legend. Docked in the bottom bar so it is always on screen and never covers a block. */
function Legend() {
  return (
    <ul className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 border-l border-border pl-4">
      {LEGEND.map((r) => (
        <li key={r} className="flex items-center gap-1.5 whitespace-nowrap">
          <svg width="18" height="6" className="shrink-0" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="18"
              y2="3"
              style={{ stroke: REL[r].stroke }}
              strokeWidth="2"
              strokeDasharray={REL[r].dash ? '4 3' : undefined}
            />
          </svg>
          <span className="text-micro text-muted-foreground">{REL[r].label}</span>
        </li>
      ))}
      <li className="whitespace-nowrap font-mono text-micro text-muted-foreground">1 ∗ cardinality</li>
    </ul>
  )
}

/** Bottom glass bar describing the hovered block, so a tooltip never covers its neighbours. */
export function Inspector({ tech, problems }: { tech?: Tech; problems: Problem[] }) {
  return (
    <div className="glass-strong pointer-events-none absolute inset-x-3 bottom-3 z-10 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 rounded-3xl px-5 py-2">
      {/* basis-64 + truncate: the hint stays one line and the legend drops below it when the
          window is too narrow for both, instead of the hint wrapping into a column */}
      <div
        className="flex min-w-0 flex-1 basis-64 items-center gap-3 overflow-hidden whitespace-nowrap"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tech?.id ?? 'hint'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="flex min-w-0 items-center gap-3"
          >
            {tech ? (
              <>
                <TechIcon tech={tech} className="size-4" />
                <span className="shrink-0 text-small font-semibold text-foreground">{tech.name}</span>
                <span className="shrink-0 text-micro uppercase text-muted-foreground">{tech.section}</span>
                <span className="truncate text-small text-muted-foreground">{tech.desc}</span>
                {problems.map((p) => (
                  <span
                    key={p.message}
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-micro',
                      p.severity === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning',
                    )}
                  >
                    {p.message}
                  </span>
                ))}
              </>
            ) : (
              <span className="truncate text-small text-muted-foreground">
                Hover a block for details · click it to trace its connections
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Legend />
    </div>
  )
}
