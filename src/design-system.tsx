import { BellIcon, PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Aurora } from '@/components/aurora'
import { BadgeMorph, type BadgeStatus } from '@/components/ruixen/badge-morph'
import { ThemeToggle } from '@/components/theme-toggle'
import { Toast } from '@/components/toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Mark, Wordmark } from '@/components/wordmark'
import { REL } from './components/nodes'
import type { Rel } from './types'

const COLORS = [
  ['background', 'bg-background'],
  ['card', 'bg-card'],
  ['muted', 'bg-muted'],
  ['accent', 'bg-accent'],
  ['foreground', 'bg-foreground'],
  ['muted-foreground', 'bg-muted-foreground'],
  ['subtle-foreground', 'bg-subtle-foreground'],
  ['primary', 'bg-primary'],
  ['link', 'bg-link'],
  ['ring', 'bg-ring'],
  ['destructive', 'bg-destructive'],
  ['warning', 'bg-warning'],
  ['success', 'bg-success'],
  ['border', 'bg-border'],
  ['glass', 'glass'],
  ['forge 1 / 2 / 3', 'bg-forge'],
  ['forge deep', 'bg-forge-deep'],
] as const

const TYPE = [
  ['display', 'text-display', 'Forge your stack.'],
  ['h1', 'text-h1', 'See what breaks before it ships'],
  ['h2', 'text-h2', 'Supabase'],
  ['h3', 'text-h3', 'Missing auth'],
  ['body', 'text-body', 'Postgres with auth, storage and edge functions.'],
  ['small', 'text-small', 'needed by Next.js'],
  ['caption', 'text-caption uppercase', 'Needed'],
  ['micro', 'text-micro uppercase font-mono', 'ts · js · sql'],
] as const

const SHADOWS = ['shadow-xs', 'shadow-glass', 'shadow-float', 'shadow-glow'] as const
const RADII = [
  'rounded-sm',
  'rounded-md',
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-3xl',
  'rounded-full',
] as const
const STATUSES: [BadgeStatus, string][] = [
  ['idle', 'Empty stack'],
  ['success', 'Stack is coherent'],
  ['warning', '2 warnings'],
  ['error', '1 blocking'],
  ['loading', 'Checking'],
]
const WIRES: Rel[] = [
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-caption uppercase text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

/** /design-system — every token and component with its states, in both themes. Not indexed. */
export default function DesignSystem() {
  const [status, setStatus] = useState(0)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    document.title = 'Design system · StackForge'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.append(robots)
    return () => robots.remove()
  }, [])

  return (
    <div className="relative h-dvh overflow-y-auto bg-background text-foreground">
      <Aurora />
      <div className="relative mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="flex items-center gap-3">
          <Mark />
          <Wordmark />
          <span className="text-caption uppercase text-muted-foreground">Design system</span>
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </header>

        <div>
          <h1 className="text-display">
            Tokens first.
            <span className="block text-subtle-foreground">Everything else follows.</span>
          </h1>
          <p className="mt-4 max-w-xl text-body text-muted-foreground">
            Every colour, size and motion in StackForge comes from src/index.css. Contrast is checked by
            src/design/contrast.test.ts on every <span className="font-mono">pnpm check</span>.
          </p>
        </div>

        <Section title="Colour">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COLORS.map(([name, cls]) => (
              <figure key={name} className="space-y-1.5">
                <div className={`h-14 rounded-xl border border-border ${cls}`} />
                <figcaption className="font-mono text-micro text-muted-foreground">{name}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title="Type">
          <div className="space-y-3">
            {TYPE.map(([name, cls, sample]) => (
              <div key={name} className="flex items-baseline gap-6">
                <span className="w-16 shrink-0 font-mono text-micro text-muted-foreground">{name}</span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-6">
              <span className="w-16 shrink-0 font-mono text-micro text-muted-foreground">accent</span>
              <span className="text-forge text-h1">Ember gradient</span>
            </div>
          </div>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section title="Radius">
            <div className="flex flex-wrap gap-3">
              {RADII.map((r) => (
                <div key={r} className={`grid size-16 place-items-center border border-border bg-card ${r}`}>
                  <span className="font-mono text-micro text-muted-foreground">{r.replace('rounded-', '')}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Depth">
            <div className="flex flex-wrap gap-4">
              {SHADOWS.map((s) => (
                <div key={s} className={`grid h-16 w-24 place-items-center rounded-xl bg-card ${s}`}>
                  <span className="font-mono text-micro text-muted-foreground">{s.replace('shadow-', '')}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <PlusIcon /> Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Notifications">
              <BellIcon />
            </Button>
          </div>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section title="Fields">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ds-url">Console URL</Label>
                <Input id="ds-url" placeholder="https://…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-bad">Invalid</Label>
                <Input id="ds-bad" aria-invalid defaultValue="not a url" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-off">Disabled</Label>
                <Input id="ds-off" disabled placeholder="read only" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-notes">Notes</Label>
                <Textarea id="ds-notes" rows={2} />
              </div>
              <Select>
                <SelectTrigger aria-label="Build" className="w-48">
                  <SelectValue placeholder="Pick a build" />
                </SelectTrigger>
                <SelectContent position="popper" className="glass-strong rounded-2xl">
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ai">AI app</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          <Section title="Status, badges and overlays">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStatus((s) => (s + 1) % STATUSES.length)}
                aria-label="Next status"
              >
                <BadgeMorph status={STATUSES[status][0]} label={STATUSES[status][1]} />
              </button>
              <p className="text-small text-muted-foreground">Click the pill to cycle its states.</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>Supabase and Firebase both fill the baas slot</TooltipContent>
                </Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="glass-strong rounded-2xl">Popovers wear the strong glass.</PopoverContent>
                </Popover>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear the workspace?</AlertDialogTitle>
                      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="bg-transparent">
                      <AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive">Clear everything</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={() => setToast((t) => !t)}>
                  Toast
                </Button>
              </div>
            </div>
          </Section>
        </div>

        <Section title="Wires">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WIRES.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <svg width="40" height="6" aria-hidden="true">
                  <line
                    x1="0"
                    y1="3"
                    x2="40"
                    y2="3"
                    style={{ stroke: REL[r].stroke }}
                    strokeWidth="2"
                    strokeDasharray={REL[r].dash ? '6 4' : undefined}
                  />
                </svg>
                <span className="text-small">{REL[r].label}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Motion">
          <dl className="grid grid-cols-2 gap-3 font-mono text-small sm:grid-cols-4">
            {['--duration-fast 120ms', '--duration-base 200ms', '--duration-slow 360ms', '--duration-aurora 30s'].map(
              (d) => (
                <div key={d}>
                  <dt className="text-muted-foreground">{d.split(' ')[0]}</dt>
                  <dd>{d.split(' ')[1]}</dd>
                </div>
              ),
            )}
          </dl>
          <p className="mt-3 text-small text-muted-foreground">
            Springs come from Motion; every animation stops when the OS asks for reduced motion.
          </p>
        </Section>
      </div>
      <Toast message={toast ? 'Removed Firebase' : null} onDismiss={() => setToast(false)} />
    </div>
  )
}
