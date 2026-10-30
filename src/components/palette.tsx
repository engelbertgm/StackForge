import { CheckIcon, ChevronRightIcon, InfoIcon, SearchIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, tint } from '@/lib/utils'
import { groups, techById, techs } from '../catalog'
import { blockedBy } from '../rules'
import { searchCatalog } from '../search'
import { type Highlight, highlightChip, matchesHighlight, useStack } from '../store'
import type { Group, Tech } from '../types'

const typing = (el: EventTarget | null) => /^(INPUT|TEXTAREA|SELECT)$/.test((el as HTMLElement)?.tagName ?? '')

/** Left floating panel: searchable catalog grouped by box; click to add or remove a technology. */
export function Palette({ onBlocked }: { onBlocked: (msg: string) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const search = useRef<HTMLInputElement>(null)
  const { added } = useStack()
  const selected = useMemo(() => added.map((id) => techById.get(id)!).filter(Boolean), [added])

  // "/" jumps to the search, like every command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || typing(e.target)) return
      e.preventDefault()
      search.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const needle = q.trim().toLowerCase()
  const results = useMemo(() => searchCatalog(techs, needle), [needle])
  const matches = useMemo(() => results.map((h) => h.tech), [results])
  // every reason each hit matched, for the pills on its row
  const why = useMemo(() => new Map(results.map((h) => [h.tech.id, h.why])), [results])

  return (
    <aside className="glass absolute bottom-[4.5rem] left-3 top-[4.75rem] z-10 flex w-72 flex-col rounded-3xl">
      <div className="shrink-0 space-y-2 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search technologies"
            placeholder={`Search ${techs.length} technologies…`}
            className="h-9 rounded-full bg-card pl-9 pr-9"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 font-mono text-micro text-muted-foreground">
            /
          </kbd>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-caption uppercase text-muted-foreground">Catalog</span>
          <Button variant="ghost" size="xs" onClick={() => setOpen({})}>
            Collapse all
          </Button>
        </div>
      </div>

      {/* Radix lays the viewport out as a table, which lets long rows widen past the panel */}
      <ScrollArea className="min-h-0 flex-1 px-2 pb-3 [&_[data-radix-scroll-area-viewport]>div]:!block">
        {groups.map((g) => (
          <PaletteGroup
            key={g.id}
            group={g}
            mine={matches.filter((t) => t.group === g.id)}
            why={why}
            // searching forces everything open, otherwise respect the toggle
            isOpen={!!needle || (open[g.id] ?? false)}
            onToggle={(isOpen) => setOpen((o) => ({ ...o, [g.id]: !isOpen }))}
            onBlocked={onBlocked}
            selected={selected}
          />
        ))}
      </ScrollArea>
    </aside>
  )
}

interface PaletteGroupProps {
  group: Group
  /** this box's techs that pass the search */
  mine: Tech[]
  /** every reason each search hit matched */
  why: Map<string, string[]>
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
  onBlocked: (msg: string) => void
  /** techs already on the canvas */
  selected: Tech[]
}

function PaletteGroup({ group: g, mine, why, isOpen, onToggle, onBlocked, selected }: PaletteGroupProps) {
  const { added, highlight } = useStack()
  if (!mine.length) return null
  const onCount = mine.filter((t) => added.includes(t.id)).length
  // how much of this box the active filter covers, so a closed box still says something
  const hits = highlight ? mine.filter((t) => matchesHighlight(t, highlight)).length : null

  return (
    <div className="mb-0.5">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => onToggle(isOpen)}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-accent',
          hits === 0 && 'opacity-40',
        )}
      >
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
        </motion.span>
        <span className="tint-dot size-2 rounded-full" style={tint(g)} />
        <span className="min-w-0 truncate text-caption uppercase text-foreground" title={g.name}>
          {g.name}
        </span>
        {hits !== null && <span className="font-mono text-micro text-link">{hits}</span>}
        <span className="ml-auto shrink-0 font-mono text-micro text-muted-foreground">
          {onCount ? `${onCount}/${mine.length}` : mine.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {g.sections.map((section) => (
              <PaletteSection
                key={section}
                section={section}
                items={mine.filter((t) => t.section === section)}
                why={why}
                onBlocked={onBlocked}
                selected={selected}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PaletteSection({
  section,
  items,
  why,
  onBlocked,
  selected,
}: {
  section: string
  items: Tech[]
  why: Map<string, string[]>
  onBlocked: (msg: string) => void
  selected: Tech[]
}) {
  if (!items.length) return null
  return (
    <div className="mb-1.5 ml-4 border-l border-border pl-2">
      <div className="px-2 py-1 font-mono text-micro uppercase text-muted-foreground">{section}</div>
      {items.map((t) => (
        <PaletteItem key={t.id} t={t} why={why.get(t.id) ?? []} onBlocked={onBlocked} selected={selected} />
      ))}
    </div>
  )
}

/** one pill per reason a row matched; "built-in" gets a soft fill, so it never reads as the real thing */
function WhyPills({ why }: { why: string[] }) {
  if (!why.length) return null
  return (
    <span className="flex flex-wrap gap-1 pl-4">
      {why.map((w) => (
        <span
          key={w}
          title={`Matched: ${w}`}
          className={cn(
            'whitespace-nowrap rounded-full px-1.5 font-mono text-micro',
            w.startsWith('built-in ') ? 'bg-accent text-foreground' : 'border border-border text-muted-foreground',
          )}
        >
          {w}
        </span>
      ))}
    </span>
  )
}

const itemTone = (reason: string | null, on: boolean) => {
  if (reason) return 'cursor-not-allowed text-subtle-foreground line-through'
  return on ? 'bg-accent font-medium text-foreground' : 'text-foreground hover:bg-accent'
}

const itemRing = (hit: boolean, highlight: Highlight) => {
  if (hit) return 'ring-1 ring-inset ring-ring'
  return highlight ? 'opacity-45' : ''
}

function PaletteItem({
  t,
  why,
  onBlocked,
  selected,
}: {
  t: Tech
  /** every reason this row matched the search that the row itself does not show */
  why: string[]
  onBlocked: (msg: string) => void
  selected: Tech[]
}) {
  const { added, add, requestRemove, highlight, select } = useStack()
  const on = added.includes(t.id)
  const reason = on ? null : blockedBy(t, selected)
  const hit = !!highlight && matchesHighlight(t, highlight)
  const chip = highlightChip(t, highlight)
  const press = () => {
    if (on) return requestRemove(t.id)
    if (reason) return onBlocked(reason)
    add(t.id)
  }
  return (
    <div className="group/item relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        title={reason ?? t.desc}
        aria-pressed={on}
        onClick={press}
        className={cn(
          'flex w-full flex-col gap-1 rounded-lg py-1.5 pl-2 pr-8 text-left text-small transition-colors',
          itemTone(reason, on),
          itemRing(hit, highlight),
        )}
      >
        <span className="flex w-full items-center gap-2">
          <span className="tint-dot size-2 shrink-0 rounded-sm" style={tint(t)} />
          <span className="min-w-0 truncate" title={t.name}>
            {t.name}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            {chip && <span className="rounded-full bg-muted px-1.5 font-mono text-micro text-foreground">{chip}</span>}
            {on && <CheckIcon className="size-3.5 text-success" aria-label="on the canvas" />}
          </span>
        </span>
        {/* the reasons sit on their own line, so any number of them fits without squeezing the name */}
        <WhyPills why={why} />
      </motion.button>
      {/* look before adding: opens the drawer with pros, cons and how it would fit */}
      <button
        type="button"
        aria-label={`Details for ${t.name}`}
        onClick={() => select(t.id)}
        className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/item:opacity-100"
      >
        <InfoIcon className="size-3.5" />
      </button>
    </div>
  )
}
