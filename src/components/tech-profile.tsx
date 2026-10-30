import { CheckIcon, MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { profileById } from '../catalog'
import type { Profile, Tech } from '../types'

const LICENSE: Record<Profile['license'], string> = {
  oss: 'Open source',
  'source-available': 'Source-available',
  proprietary: 'Proprietary',
}
const PRICING: Record<Profile['pricing'], string> = { free: 'Free', freemium: 'Free tier', paid: 'Paid' }
const HOSTING: Record<Profile['hosting'], string> = {
  library: 'Library',
  'self-host': 'Self-host',
  cloud: 'Cloud only',
  'cloud-or-self': 'Cloud or self-host',
}

/** the badges that answer "can I afford it, do I own it, where does it run" — green when the answer is the easy one */
function Badges({ p }: { p: Profile }) {
  const badges: [string, boolean][] = [
    [LICENSE[p.license], p.license === 'oss'],
    [PRICING[p.pricing], p.pricing === 'free'],
    [HOSTING[p.hosting], p.hosting !== 'cloud'],
  ]
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Licence, pricing and hosting">
      {badges.map(([label, easy]) => (
        <li
          key={label}
          className={cn(
            'rounded-full px-2 py-0.5 text-micro font-medium',
            easy ? 'bg-success/12 text-success' : 'bg-muted text-foreground',
          )}
        >
          {label}
        </li>
      ))}
    </ul>
  )
}

function Points({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  const Icon = good ? PlusIcon : MinusIcon
  return (
    <div>
      <h3 className="text-caption uppercase text-muted-foreground">{title}</h3>
      <ul className="mt-1.5 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-small text-foreground">
            <Icon className={cn('mt-0.5 size-3.5 shrink-0', good ? 'text-success' : 'text-destructive')} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Licence, pricing and hosting badges plus pros and cons — or a note when the tech has no profile yet. */
export function ProfileSection({ tech }: { tech: Tech }) {
  const p = profileById.get(tech.id)
  if (!p)
    return <p className="mt-4 text-small text-muted-foreground">No licence or pricing profile for this one yet.</p>
  return (
    <section className="mt-4 space-y-4">
      <Badges p={p} />
      <div className="grid gap-4">
        <Points title="Pros" items={p.pros} good />
        <Points title="Cons" items={p.cons} good={false} />
      </div>
      <p className="font-mono text-micro text-muted-foreground">Draft · checked {p.checked}</p>
    </section>
  )
}

/** One relationship with the rest of the stack, already phrased from this tech's point of view. */
export interface StackLink {
  text: string
  bad: boolean
}

/**
 * "In your stack": every line this tech draws (or would draw, before it is added) to what is
 * already on the canvas, and anything it clashes with.
 */
export function StackLinks({ links, onCanvas }: { links: StackLink[]; onCanvas: boolean }) {
  return (
    <section className="mt-5">
      <h3 className="text-caption uppercase text-muted-foreground">{onCanvas ? 'In your stack' : 'If you add it'}</h3>
      {links.length ? (
        <ul className="mt-1.5 space-y-1">
          {links.map((l) => (
            <li key={l.text} className={cn('flex gap-2 text-small', l.bad ? 'text-destructive' : 'text-foreground')}>
              {l.bad ? (
                <XIcon className="mt-0.5 size-3.5 shrink-0" />
              ) : (
                <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
              )}
              {l.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-small text-muted-foreground">No direct connection to anything on the canvas.</p>
      )}
    </section>
  )
}
