import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { techById, techs } from '../catalog'
import { type Analysis, fixesFor } from '../rules'
import { useStack } from '../store'
import type { Tech } from '../types'

/** Lists what the stack is still missing and the technologies that would fill each gap. */
export function NeedsPanel({ analysis, shifted }: { analysis: Analysis; shifted: boolean }) {
  const { added, add } = useStack()
  const [open, setOpen] = useState(true)

  const suggestions = useMemo(() => {
    // an imported stack.json can hold ids the catalog no longer has
    const selected = added.map((id) => techById.get(id)).filter((t): t is Tech => !!t)
    return analysis.missing.map(({ cap, neededBy }) => ({
      cap,
      neededBy: neededBy.map((id) => techById.get(id)?.name ?? id),
      fixes: fixesFor(cap, selected, techs),
    }))
  }, [analysis.missing, added])

  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.section
          aria-label="Needed and recommended"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={cn(
            'glass absolute top-[4.75rem] z-10 w-72 rounded-3xl transition-[right] duration-300',
            shifted ? 'right-[24.5rem]' : 'right-3',
          )}
        >
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left"
          >
            <span className="text-caption uppercase text-foreground">Needed</span>
            <span className="rounded-full bg-warning/15 px-2 font-mono text-micro text-warning">
              {suggestions.length}
            </span>
            <motion.span className="ml-auto" animate={{ rotate: open ? 0 : -90 }}>
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="max-h-[45vh] overflow-y-auto px-4 pb-4"
              >
                {suggestions.map((s, i) => (
                  <motion.li
                    key={s.cap}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="mb-3 last:mb-0"
                  >
                    <div className="text-small text-foreground">
                      Missing <span className="font-semibold">{s.cap}</span>
                    </div>
                    <div className="text-small text-muted-foreground">needed by {s.neededBy.join(', ')}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {s.fixes.map((f) => (
                        <Button key={f.id} variant="outline" size="xs" title={f.desc} onClick={() => add(f.id)}>
                          <PlusIcon />
                          {f.name}
                        </Button>
                      ))}
                      {!s.fixes.length && (
                        <span className="text-small text-muted-foreground">nothing compatible left to add</span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
