import { ChevronDownIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn, tint } from '@/lib/utils'
import { allLangs, allTags, builds, groups } from '../catalog'
import type { Highlight } from '../store'

type SetHighlight = (h: Highlight) => void

const LANG_COLUMNS: { title: string; items: string[] }[] = [
  { title: 'Web', items: ['ts', 'js', 'css', 'html'] },
  {
    title: 'Backend',
    items: ['py', 'go', 'rust', 'java', 'kotlin', 'csharp', 'php', 'ruby', 'elixir', 'erlang', 'groovy'],
  },
  { title: 'Native & Mobile', items: ['swift', 'dart', 'cpp'] },
  { title: 'Data & Query', items: ['sql', 'dax', 'proto', 'apex', 'abap', 'liquid'] },
  { title: 'Config & Markup', items: ['yaml', 'hcl', 'json', 'md', 'xml', 'bash', 'none'] },
]

const TAG_COLUMNS: { title: string; items: string[] }[] = [
  { title: 'Platform', items: ['web', 'mobile', 'desktop', 'edge', 'embedded', 'systems', 'serverless'] },
  {
    title: 'Discipline',
    items: ['backend', 'data', 'ml', 'ai', 'design', 'a11y', 'pm', 'dev', 'devtool', 'infra', 'ci', 'research'],
  },
  { title: 'Delivery', items: ['cloud', 'saas', 'hosted', 'selfhost', 'oss', 'privacy'] },
  { title: 'Vendor', items: ['aws', 'google', 'microsoft', 'atlassian', 'enterprise'] },
  { title: 'Other', items: ['protocol', 'unix'] },
]

/** anything in the catalog the columns above forgot still shows up */
function withLeftovers(columns: { title: string; items: string[] }[], all: string[]) {
  const known = new Set(columns.flatMap((c) => c.items))
  const rest = all.filter((v) => !known.has(v))
  const cols = columns
    .map((c) => ({ ...c, items: c.items.filter((i) => all.includes(i)) }))
    .filter((c) => c.items.length)
  return rest.length ? [...cols, { title: 'Uncategorised', items: rest }] : cols
}

/** the pill every filter wears: a tracked label, the current value, and a ring while it is active */
const pill =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-transparent px-3 text-small text-foreground transition-colors hover:bg-accent data-[active=true]:border-transparent data-[active=true]:bg-accent data-[active=true]:ring-1 data-[active=true]:ring-ring'

function PillLabel({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-micro uppercase text-muted-foreground">{label}</span>
      <span className="max-w-28 truncate font-medium">{value}</span>
    </>
  )
}

/**
 * One popover per dimension, its vocabulary laid out as wrapped columns rather than a long
 * scrolling list, so the whole set is visible at once and never pushes the page sideways.
 */
function FilterMenu({
  kind,
  label,
  columns,
  upper,
  highlight,
  setHighlight,
}: {
  kind: 'lang' | 'tag'
  label: string
  columns: { title: string; items: string[] }[]
  upper?: boolean
  highlight: Highlight
  setHighlight: SetHighlight
}) {
  const [open, setOpen] = useState(false)
  const active = highlight?.kind === kind ? highlight.value : null
  const show = (v: string) => (upper ? v.toUpperCase() : v)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={pill} data-active={!!active}>
        <PillLabel label={label} value={active ? show(active) : 'all'} />
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="glass-strong max-h-[70vh] w-[min(92vw,690px)] overflow-y-auto rounded-2xl p-4"
      >
        <div className="flex flex-wrap content-start gap-x-4 gap-y-4">
          {columns.map((c) => (
            <div key={c.title} className="w-[118px]">
              <div className="mb-1.5 border-b border-border pb-1 text-caption uppercase text-muted-foreground">
                {c.title}
              </div>
              {c.items.map((v) => {
                const on = active === v
                return (
                  <button
                    type="button"
                    key={v}
                    aria-pressed={on}
                    className={cn(
                      'block w-full truncate rounded-full px-2 py-1 text-left text-small transition-colors',
                      on ? 'bg-foreground text-background' : 'text-foreground hover:bg-accent',
                    )}
                    onClick={() => {
                      setHighlight(on ? null : { kind, value: v })
                      setOpen(false)
                    }}
                  >
                    {show(v)}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * "What are you building?" — the other filters ask what a tech *is*, this one asks what it
 * would be *for*. Picking SaaS lights up every block that plays a part in one, each wearing
 * the part it plays: n8n turns up as Glue, Stripe as Billing.
 */
function BuildFilter({ highlight, setHighlight }: { highlight: Highlight; setHighlight: SetHighlight }) {
  const value = highlight?.kind === 'build' ? highlight.value : ''
  return (
    <Select value={value} onValueChange={(v) => setHighlight({ kind: 'build', value: v })}>
      <SelectTrigger aria-label="Build" className={cn(pill, 'h-8 w-auto')} data-active={!!value}>
        <span className="text-micro uppercase text-muted-foreground">Build</span>
        <span className="max-w-28 truncate font-medium">
          <SelectValue placeholder="anything">{builds.find((b) => b.id === value)?.name}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="glass-strong max-h-[60vh] rounded-2xl">
        {builds.map((b) => (
          <SelectItem key={b.id} value={b.id} textValue={b.name} className="rounded-xl">
            <span className="flex flex-col">
              <span className="font-medium">{b.name}</span>
              <span className="text-small text-muted-foreground">{b.desc}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Box is a flat list of 15 — a plain select, not a mega-menu. */
function BoxFilter({ highlight, setHighlight }: { highlight: Highlight; setHighlight: SetHighlight }) {
  const value = highlight?.kind === 'group' ? highlight.value : ''
  return (
    <Select value={value} onValueChange={(v) => setHighlight({ kind: 'group', value: v })}>
      <SelectTrigger aria-label="Box" className={cn(pill, 'h-8 w-auto')} data-active={!!value}>
        <span className="text-micro uppercase text-muted-foreground">Box</span>
        <span className="max-w-28 truncate font-medium">
          <SelectValue placeholder="all" />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="glass-strong max-h-[60vh] rounded-2xl">
        {groups.map((g) => (
          <SelectItem key={g.id} value={g.id} textValue={g.name} className="rounded-xl">
            <span className="tint-dot size-2 rounded-full" style={tint(g)} />
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** The highlight filters in the top bar: build, language, ecosystem and box. One is active at a time. */
export function Filters({ highlight, setHighlight }: { highlight: Highlight; setHighlight: SetHighlight }) {
  const langCols = useMemo(() => withLeftovers(LANG_COLUMNS, allLangs), [])
  const tagCols = useMemo(() => withLeftovers(TAG_COLUMNS, allTags), [])
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <BuildFilter highlight={highlight} setHighlight={setHighlight} />
      <FilterMenu
        kind="lang"
        label="Language"
        columns={langCols}
        upper
        highlight={highlight}
        setHighlight={setHighlight}
      />
      <FilterMenu kind="tag" label="Ecosystem" columns={tagCols} highlight={highlight} setHighlight={setHighlight} />
      <BoxFilter highlight={highlight} setHighlight={setHighlight} />
      {highlight && (
        <Button variant="ghost" size="icon-sm" onClick={() => setHighlight(null)} aria-label="Clear filter">
          <XIcon />
        </Button>
      )}
    </div>
  )
}
