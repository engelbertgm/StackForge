import { BaseEdge, type EdgeProps, Handle, type NodeProps, Position } from '@xyflow/react'
import { XIcon } from 'lucide-react'
import { type CSSProperties, useEffect, useState } from 'react'
import { cn, tint } from '@/lib/utils'
import { groupById } from '../catalog'
import { GROUP_HEADER, NODE_H, NODE_W, PAD } from '../layout'
import type { Route } from '../routing'
import type { Card, Problem, Rel, Tech } from '../types'

/* ---------- relationship styling ----------
 * `dash` marks a *referential* link — Next.js is built on React, Vitest tests Vite.
 * Solid lines are real runtime dependencies: something requires, reads or deploys something else.
 * Direction is uniform: the arrow points at what you depend on. Colours are --rel-* tokens,
 * deepened in the light theme so every wire holds 3:1 on paper.
 */
/** Colour token, label and line style for every relationship type; shared by the wires and the legend. */
export const REL: Record<Rel, { stroke: string; label: string; dash?: boolean; both?: boolean }> = {
  extends: { stroke: 'var(--rel-extends)', label: 'builds on', dash: true },
  builds: { stroke: 'var(--rel-extends)', label: 'builds', dash: true },
  tests: { stroke: 'var(--rel-tests)', label: 'tests', dash: true },
  styles: { stroke: 'var(--rel-styles)', label: 'styled with', dash: true },
  types: { stroke: 'var(--rel-types)', label: 'typed by', dash: true },
  monitors: { stroke: 'var(--rel-monitors)', label: 'monitors', dash: true },
  tracks: { stroke: 'var(--rel-monitors)', label: 'tracks', dash: true },

  /* the solid data links are a hue apart each — cyan, lime, indigo — and no closer than 50°
     to any other solid line (amber deploys, fuchsia automates) */
  requires: { stroke: 'var(--rel-requires)', label: 'requires' },
  consumes: { stroke: 'var(--rel-consumes)', label: 'reads from' },
  queries: { stroke: 'var(--rel-queries)', label: 'queries', both: true },
  syncs: { stroke: 'var(--rel-queries)', label: 'syncs with', both: true },
  deploys: { stroke: 'var(--rel-deploys)', label: 'deploys' },
  hosts: { stroke: 'var(--rel-deploys)', label: 'hosts' },
  orchestrates: { stroke: 'var(--rel-deploys)', label: 'orchestrates' },
  automates: { stroke: 'var(--rel-automates)', label: 'automates' },

  conflicts: { stroke: 'var(--rel-conflicts)', label: 'incompatible', dash: true, both: true },
}

const CARD_ENDS: Record<Card, [string, string]> = {
  '1-1': ['1', '1'],
  '1-n': ['1', '∗'],
  'n-1': ['∗', '1'],
  'n-n': ['∗', '∗'],
}

/* ---------- brand icon, falls back to initials when the slug is wrong or offline ---------- */

/**
 * A technology's simpleicons.org logo in its own colour, or its initials when there is none.
 * The logo is a mask painted with --ink, so a white or black brand mark stays visible on both themes.
 */
export function TechIcon({ tech, className }: { tech: Tech; className?: string }) {
  const src = tech.icon ? `https://cdn.simpleicons.org/${tech.icon}` : null
  const [failed, setFailed] = useState(false)
  // a mask has no error event, so probe the same URL to learn whether the slug exists
  useEffect(() => {
    if (!src) return
    const probe = new Image()
    probe.onerror = () => setFailed(true)
    probe.src = src
  }, [src])
  const initials = tech.name
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase()

  if (!src || failed)
    return (
      <span
        aria-hidden="true"
        style={tint(tech)}
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-md bg-[color-mix(in_oklch,var(--ink)_22%,transparent)] font-mono text-micro font-medium text-foreground',
          className,
        )}
      >
        {initials}
      </span>
    )

  return (
    <span
      aria-hidden="true"
      className={cn('tint-icon size-5 shrink-0', className)}
      style={{ ...tint(tech), '--icon': `url(${src})` } as CSSProperties}
    />
  )
}

/* ---------- tech block ---------- */

/** Props a TechNode card receives from the canvas. */
export interface TechData extends Record<string, unknown> {
  tech: Tech
  problems: Problem[]
  dimmed: boolean
  active: boolean
  onHover: (id: string | null) => void
  onRemove: (id: string) => void
}

/** the card's outline: red for an error, amber for a warning, its own colour while active */
function ringClass(error: boolean, warn: boolean, active: boolean): string {
  if (error) return 'ring-2 ring-destructive shadow-[0_0_20px_-4px_var(--destructive)]'
  if (warn) return 'ring-2 ring-warning shadow-[0_0_20px_-6px_var(--warning)]'
  return active ? 'ring-2 ring-(--ink) shadow-[0_0_24px_-4px_var(--ink)]' : 'ring-1 ring-glass-border shadow-xs'
}

/** One technology card on the canvas: name, icon, language chips and its problem ring. */
export function TechNode({ data }: NodeProps & { data: TechData }) {
  const { tech, problems, dimmed, active, onHover, onRemove } = data
  const error = problems.some((p) => p.severity === 'error')
  const warn = !error && problems.length > 0

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only feeds the inspector panel; React Flow wraps the card in its own focusable, clickable node
    <div
      className={cn(
        // opaque on purpose: wires pass behind the card, never through the text
        'group relative rounded-xl bg-node px-2.5 py-2 transition-[opacity,box-shadow] duration-200',
        ringClass(error, warn, active),
      )}
      onMouseEnter={() => onHover(tech.id)}
      onMouseLeave={() => onHover(null)}
      style={{ ...tint(tech), width: NODE_W, height: NODE_H, opacity: dimmed ? 0.14 : 1 }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />

      <button
        type="button"
        aria-label={`Remove ${tech.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(tech.id)
        }}
        className="absolute -right-2 -top-2 z-20 hidden size-5 items-center justify-center rounded-full bg-foreground text-background shadow-xs transition-transform hover:scale-110 hover:bg-destructive hover:text-primary-foreground group-hover:flex"
      >
        <XIcon className="size-3" />
      </button>

      {/* long names (Supabase Edge Functions, GitHub Issues & Projects) wrap to a second line */}
      <div className="flex items-start gap-2">
        <TechIcon tech={tech} />
        <span title={tech.name} className="line-clamp-2 text-small leading-tight font-medium text-foreground">
          {tech.name}
        </span>
        {(error || warn) && (
          <span className={cn('ml-auto text-small font-semibold', error ? 'text-destructive' : 'text-warning')}>!</span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {tech.langs.slice(0, 3).map((l) => (
          <span key={l} className="rounded-md bg-muted px-1 py-px font-mono text-micro uppercase text-muted-foreground">
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- group box ---------- */

/** Props a GroupNode box receives from the canvas. */
export interface GroupData extends Record<string, unknown> {
  groupId: string
  sections: { name: string; y: number }[]
  dimmed: boolean
}

/** The frosted box that holds one group of technologies, with its section lanes. */
export function GroupNode({ data }: NodeProps & { data: GroupData }) {
  const group = groupById.get(data.groupId)!
  return (
    <div
      // translucent so wires crossing underneath stay traceable instead of vanishing
      className="h-full w-full rounded-3xl border border-[color-mix(in_oklch,var(--ink)_40%,transparent)] bg-(--group-fill) shadow-[0_0_32px_-8px_color-mix(in_oklch,var(--ink)_45%,transparent)] backdrop-blur-sm transition-opacity duration-300"
      style={{ ...tint(group), opacity: data.dimmed ? 0.28 : 1 }}
    >
      <div
        className="flex items-center gap-2 text-caption uppercase text-foreground"
        style={{ height: GROUP_HEADER, paddingInlineStart: PAD }}
      >
        <span className="tint-dot size-2 rounded-full" />
        {group.name}
      </div>
      {data.sections.map((s) => (
        <div
          key={s.name}
          className="absolute font-mono text-micro uppercase text-muted-foreground"
          style={{ left: PAD, top: s.y + 6 }}
        >
          {s.name}
        </div>
      ))}
    </div>
  )
}

/* ---------- drag ghost ----------
 * The block you grab never moves. React Flow reports the position it *would* take — already
 * clamped to its parent box — and App renders that spot as this outline. On release the real
 * block is committed here and the ghost goes away.
 */
/** Props a GhostNode receives: the colour and label of the thing being dragged. */
export interface GhostData extends Record<string, unknown> {
  color: string
  label: string
}

/** Dashed preview of where a dragged block or box will land. */
export function GhostNode({ data }: NodeProps & { data: GhostData }) {
  return (
    <div
      className="pointer-events-none flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-(--ink) bg-[color-mix(in_oklch,var(--ink)_12%,transparent)] shadow-[0_0_22px_-6px_var(--ink)]"
      style={tint(data)}
    >
      <span className="truncate px-2 text-caption uppercase text-foreground">{data.label}</span>
    </div>
  )
}

/* ---------- wires: geometry comes from planRoutes(), this only paints it ---------- */

/** Props a RelEdge wire receives: relationship, cardinality and its planned route. */
export interface RelEdgeData extends Record<string, unknown> {
  rel: Rel
  card?: Card
  /** mutual dependency: arrowheads and travelling dots in both directions */
  both?: boolean
  active: boolean
  dimmed: boolean
  /** geometry planned in App against every block and every other wire */
  route?: Route
}

const wireOpacity = (d: RelEdgeData) => {
  if (d.dimmed) return 0.06
  return d.active ? 1 : 0.5
}

/** Paints one relationship wire along the route planRoutes() chose, with its cardinality marks. */
export function RelEdge({ id, markerStart, markerEnd, data }: EdgeProps & { data?: RelEdgeData }) {
  if (!data?.route) return null
  const { route } = data
  const rel = REL[data.rel]
  const ends = data.card ? CARD_ENDS[data.card] : null
  const opacity = wireOpacity(data)
  // one speed for every wire: a short hop no longer looks like the dot bouncing on the spot
  const dur = `${Math.min(3.4, Math.max(0.7, route.len / 190)).toFixed(2)}s`

  return (
    <>
      <BaseEdge
        id={id}
        path={route.path}
        /* a mutual link is arrowed at both ends — queries, syncs, incompatible */
        markerStart={markerStart}
        markerEnd={markerEnd}
        /* without this React Flow lays a 20px invisible hit path over the blocks and eats their clicks */
        interactionWidth={0}
        style={{
          stroke: rel.stroke,
          strokeWidth: data.active ? 2.2 : 1.3,
          strokeDasharray: rel.dash ? '6 4' : undefined,
          opacity,
          fill: 'none',
        }}
      />

      {ends && !data.dimmed && (
        /* the halo keeps the mark readable even where a wire does pass under it */
        <g
          style={{ fill: rel.stroke, stroke: 'var(--mark-halo)' }}
          strokeWidth="3"
          paintOrder="stroke"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          opacity={opacity}
          className="font-mono"
        >
          <text x={route.ls.x} y={route.ls.y}>
            {ends[0]}
          </text>
          <text x={route.lt.x} y={route.lt.y}>
            {ends[1]}
          </text>
        </g>
      )}

      {/* travelling dots exist only while this edge is selected; a mutual link flows both ways */}
      {data.active && (
        <>
          <circle r="4" style={{ fill: rel.stroke }}>
            <animateMotion dur={dur} repeatCount="indefinite" path={route.path} />
          </circle>
          {data.both && (
            <circle r="4" style={{ fill: rel.stroke }}>
              <animateMotion
                dur={dur}
                repeatCount="indefinite"
                path={route.path}
                keyPoints="1;0"
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          )}
        </>
      )}
    </>
  )
}
