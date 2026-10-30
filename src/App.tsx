import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type EdgeTypes,
  type InternalNode,
  MarkerType,
  MiniMap,
  type Node,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
  useStoreApi,
  ViewportPortal,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Aurora } from '@/components/aurora'
import { DeleteGuard } from '@/components/dialogs'
import { Drawer } from '@/components/drawer'
import { Inspector } from '@/components/inspector'
import { NeedsPanel } from '@/components/needs-panel'
import { Palette } from '@/components/palette'
import type { StackLink } from '@/components/tech-profile'
import { Toast } from '@/components/toast'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import { groupById, stackRules, techById } from './catalog'
import { GhostNode, GroupNode, REL, RelEdge, TechNode } from './components/nodes'
import { type Box, layout, NODE_H, NODE_W } from './layout'
import { planRoutes, type Rect, type Route } from './routing'
import { type Analysis, analyze, blockedBy } from './rules'
import { type Guide, snap } from './snap'
import { matchesHighlight, useStack } from './store'
import type { Tech } from './types'

/** how close, in screen pixels, two edges get before the drag pulls them together */
const SNAP_PX = 6
/** the drag preview is a real node, so it needs an id no technology can collide with */
const GHOST_ID = '__ghost'

const nodeTypes = { tech: TechNode, group: GroupNode, ghost: GhostNode } as unknown as NodeTypes
const edgeTypes = { rel: RelEdge } as unknown as EdgeTypes

/**
 * ReactFlow's own `fitView` prop fires at init, before the restored stack has been
 * measured, so it fits an empty canvas. Wait for the real measurements instead.
 */
function FitOnDemand({ tick, drawerOpen }: { tick: string; drawerOpen: boolean }) {
  const { fitView } = useReactFlow()
  // React Flow's own measured pane size. Waiting on a timer after our ResizeObserver was a
  // race — if React Flow had not re-measured yet the fit used the old size and never retried,
  // which is how the bottom of the diagram ended up off-screen. Its store cannot be stale.
  const pane = useStore((s) => `${Math.round(s.width)}x${Math.round(s.height)}`)
  useEffect(() => {
    // the canvas runs full-bleed under the glass panels, so frame the stack inside them
    const padding = { top: '92px', bottom: '84px', left: '316px', right: drawerOpen ? '384px' : '28px' } as const
    const id = requestAnimationFrame(() => void fitView({ padding }))
    return () => cancelAnimationFrame(id)
  }, [tick, pane, fitView, drawerOpen])
  return null
}

/**
 * The lines that say *why* a drag snapped where it did. ViewportPortal puts them inside the
 * pan/zoom transform, so a guide stays welded to the blocks it relates as the canvas moves.
 * Thickness and overhang are divided by the zoom, so the line stays one crisp pixel whether
 * you are zoomed right in or looking at the whole stack.
 */
function AlignmentGuides({ guides }: { guides?: Guide[] }) {
  const zoom = useStore((s) => s.transform[2])
  if (!guides?.length) return null
  const thick = 1 / zoom
  const over = 10 / zoom

  return (
    <ViewportPortal>
      {guides.map((g) => (
        <div
          key={`${g.axis}${g.at}`}
          className="pointer-events-none absolute bg-ring"
          style={{
            boxShadow: `0 0 ${6 / zoom}px var(--ring)`,
            ...(g.axis === 'x'
              ? { left: g.at, top: g.from - over, width: thick, height: g.to - g.from + over * 2 }
              : { left: g.from - over, top: g.at, width: g.to - g.from + over * 2, height: thick }),
          }}
        />
      ))}
    </ViewportPortal>
  )
}

/** what the drag preview looks like: the size, colour and label of the thing being dragged */
function ghostLook(id: string, boxes: Box[]) {
  if (id.startsWith('group:')) {
    const box = boxes.find((b) => `group:${b.groupId}` === id)
    const group = box && groupById.get(box.groupId)
    return box ? { parentId: undefined, w: box.w, h: box.h, color: group?.color, label: group?.name ?? '' } : null
  }
  const tech = techById.get(id)
  if (!tech) return null
  // a block's drag position is relative to its box, exactly like its resting position
  return { parentId: `group:${tech.group}`, w: NODE_W, h: NODE_H, color: tech.color, label: tech.name }
}

const size = (m: InternalNode) => ({ w: m.measured.width ?? NODE_W, h: m.measured.height ?? NODE_H })

/** what a dragged node may align against: its box-mates for a block, the other boxes for a box */
function peersOf(lookup: Map<string, InternalNode>, n: Node) {
  const isGroup = n.id.startsWith('group:')
  const isPeer = (id: string, m: InternalNode) =>
    id !== n.id && id !== GHOST_ID && isGroup === id.startsWith('group:') && (isGroup || m.parentId === n.parentId)
  return [...lookup]
    .filter(([id, m]) => isPeer(id, m))
    .map(([, m]) => ({ x: m.internals.positionAbsolute.x, y: m.internals.positionAbsolute.y, ...size(m) }))
}

/**
 * A snap must never push a block past the box edge React Flow already clamped it to.
 * Where the clamp wins, that axis did not really align, so its guide has to go too.
 */
function clampToBox(
  at: { x: number; y: number; guides: Guide[] },
  me: { w: number; h: number },
  box: { w: number; h: number },
) {
  const x = Math.min(Math.max(at.x, 0), box.w - me.w)
  const y = Math.min(Math.max(at.y, 0), box.h - me.h)
  const guides = at.guides.filter((g) => (g.axis === 'x' ? x === at.x : y === at.y))
  return { x, y, guides }
}

const touches = (e: { source: string; target: string }, id: string | null) =>
  !!id && (e.source === id || e.target === id)

/** one relationship as a React Flow edge, faded when it is outside the selection or the filter */
function relEdge(
  e: Analysis['edges'][number],
  selected: string | null,
  passes: (t: Tech) => boolean,
  route?: Route,
): Edge {
  const style = REL[e.rel]
  const active = touches(e, selected)
  const both = style.both || e.both
  const bothEndsPass = passes(techById.get(e.source)!) && passes(techById.get(e.target)!)
  const marker = { type: MarkerType.ArrowClosed, color: style.stroke, width: 16, height: 16 }
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'rel',
    markerEnd: marker,
    markerStart: both ? marker : undefined,
    zIndex: active ? 5 : 1,
    data: { rel: e.rel, card: e.card, both, active, dimmed: (!!selected && !active) || !bothEndsPass, route },
  }
}

/** the clicked block and every block wired to it — everything else fades out */
function neighboursOf(id: string, rel: Analysis['edges']): Set<string> {
  const set = new Set([id])
  for (const e of rel) {
    if (e.source === id) set.add(e.target)
    if (e.target === id) set.add(e.source)
  }
  return set
}

function Canvas() {
  const { added, nodePos, groupPos, selected, highlight, fitTick, select, setNodePos, setGroupPos, requestRemove } =
    useStack()

  const [hovered, setHovered] = useState<string | null>(null)
  /** where the block being dragged would land — null whenever no drag is in flight */
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number; guides: Guide[] } | null>(null)
  const dragging = !!ghost

  const techs = useMemo(() => added.map((id) => techById.get(id)).filter(Boolean) as Tech[], [added])
  const analysis = useMemo(() => analyze(techs, stackRules), [techs])
  const { problems, edges: rel } = analysis
  const canvasRef = useRef<HTMLElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 1600, h: 900 })
  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { boxes, placed } = useMemo(
    () => layout(techs, canvasSize.w, canvasSize.h),
    [techs, canvasSize.w, canvasSize.h],
  )

  // a tech opened from the palette for a look is not on the canvas, so nothing should fade
  const neighbours = useMemo(
    () => (selected && added.includes(selected) ? neighboursOf(selected, rel) : null),
    [selected, rel, added],
  )

  const matchesFilter = (t: Tech) => matchesHighlight(t, highlight)

  const isDim = (t: Tech) => !matchesFilter(t) || (!!neighbours && !neighbours.has(t.id))

  const nodes = useMemo<Node[]>(() => {
    const groupNodes: Node[] = boxes.map((b) => {
      const members = techs.filter((t) => t.group === b.groupId)
      return {
        id: `group:${b.groupId}`,
        type: 'group',
        position: groupPos[b.groupId] ?? { x: b.x, y: b.y },
        width: b.w,
        height: b.h,
        style: { width: b.w, height: b.h },
        draggable: true,
        selectable: false,
        /* box 0 < wires 1 < card 2: lines cross the boxes but never the cards */
        zIndex: 0,
        data: { groupId: b.groupId, sections: b.sections, dimmed: members.every(isDim) },
      }
    })

    const techNodes: Node[] = placed.map((p) => {
      const tech = techById.get(p.techId)!
      return {
        id: p.techId,
        type: 'tech',
        parentId: `group:${p.groupId}`,
        extent: 'parent' as const,
        position: nodePos[p.techId] ?? { x: p.x, y: p.y },
        width: NODE_W,
        height: NODE_H,
        zIndex: 2,
        data: {
          tech,
          problems: problems.filter((pr) => pr.techId === p.techId),
          dimmed: isDim(tech),
          active: selected === p.techId,
          onHover: setHovered,
          onRemove: requestRemove,
        },
      }
    })

    return [...groupNodes, ...techNodes]
  }, [boxes, placed, groupPos, nodePos, problems, selected, highlight, techs])

  /**
   * The ghost is appended in its own memo rather than built into `nodes` above, so the real
   * blocks keep their object identity while a drag runs: React Flow then only has to adopt
   * the one node that actually changed each frame instead of all of them.
   */
  const nodesWithGhost = useMemo<Node[]>(() => {
    const look = ghost && ghostLook(ghost.id, boxes)
    if (!ghost || !look) return nodes
    return [
      ...nodes,
      {
        id: GHOST_ID,
        type: 'ghost',
        parentId: look.parentId,
        position: { x: ghost.x, y: ghost.y },
        width: look.w,
        height: look.h,
        style: { width: look.w, height: look.h },
        draggable: false,
        selectable: false,
        /* above the cards, so the landing spot is never hidden behind one */
        zIndex: 6,
        data: { color: look.color ?? 'var(--ghost-fallback)', label: look.label },
      },
    ]
  }, [nodes, ghost, boxes])

  /**
   * Wires are planned against every block at once — see routing.ts. React Flow keeps node
   * geometry in its own store, so subscribe to a cheap position signature to know when to
   * re-plan.
   *
   * That signature is frozen for the length of a drag. planRoutes() costs a full orthogonal
   * search over every wire against every block, and paying it on each drag frame re-rendered
   * the whole canvas at 60fps — the card trailed the cursor so far behind that you could not
   * tell where it would land. Held constant, the selector returns early, nothing downstream
   * re-renders, and the card moves at React Flow's own speed as a preview of its landing spot
   * (index.css gives it the dashed outline and fades the stale wires). One re-plan on drop.
   */
  const store = useStoreApi()
  const posKey = useStore((s) => {
    if (dragging) return 'dragging'
    let k = ''
    for (const [id, n] of s.nodeLookup)
      k += `${id}:${n.internals.positionAbsolute.x},${n.internals.positionAbsolute.y};`
    return k
  })
  const routes = useMemo(() => {
    const rects = new Map<string, Rect>()
    for (const [id, n] of store.getState().nodeLookup) {
      rects.set(id, {
        x: n.internals.positionAbsolute.x,
        y: n.internals.positionAbsolute.y,
        w: n.measured.width ?? (id.startsWith('group:') ? 0 : NODE_W),
        h: n.measured.height ?? (id.startsWith('group:') ? 0 : NODE_H),
        parent: n.parentId,
        box: id.startsWith('group:'),
      })
    }
    return planRoutes(rects, rel)
  }, [posKey, rel, store])

  /**
   * Where a drag actually lands. React Flow hands us the raw position; this pulls it onto any
   * neighbour it is nearly aligned with and reports the guides to draw. Both drag handlers go
   * through here, so the ghost you see and the position committed on drop cannot disagree.
   *
   * A block aligns against its own box-mates and a box against the other boxes — aligning a
   * block to something in a different box would be meaningless, since `extent: 'parent'`
   * means it can never get there. Hold Alt to drop exactly where the cursor is.
   */
  const resolveDrag = useCallback(
    (n: Node, free: boolean) => {
      const raw = { x: n.position.x, y: n.position.y, guides: [] as Guide[] }
      if (free) return raw

      const { nodeLookup, transform } = store.getState()
      const self = nodeLookup.get(n.id)
      const peers = peersOf(nodeLookup, n)
      if (!self || !peers.length) return raw

      const parent = n.parentId ? nodeLookup.get(n.parentId) : undefined
      // a block's position is relative to its box, so snap in absolute space and convert back
      const origin = parent?.internals.positionAbsolute ?? { x: 0, y: 0 }
      const me = { x: origin.x + n.position.x, y: origin.y + n.position.y, ...size(self) }
      // tolerance in flow units, so the pull feels the same at every zoom level
      const hit = snap(me, peers, SNAP_PX / transform[2])
      const moved = { x: hit.x - origin.x, y: hit.y - origin.y, guides: hit.guides }
      return parent ? clampToBox(moved, me, size(parent)) : moved
    },
    [store],
  )

  const edges = useMemo<Edge[]>(
    () => rel.map((e) => relEdge(e, selected, matchesFilter, routes.get(e.id))),
    [rel, selected, highlight, routes],
  )

  const undoRemove = useStack((s) => s.undoRemove)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if (typing) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undoRemove()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undoRemove])

  const selectedTech = selected ? techById.get(selected) : undefined

  return (
    <div className="relative h-dvh overflow-hidden bg-background text-foreground">
      <Aurora />

      {/* the canvas runs full-bleed; every panel floats over it as glass */}
      <main ref={canvasRef} className="absolute inset-0">
        <ReactFlow
          className={dragging ? 'is-dragging' : undefined}
          nodes={nodesWithGhost}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, n) => !n.id.startsWith('group:') && select(n.id)}
          onPaneClick={() => select(null)}
          /* n.position is the position the block *would* take, already clamped to its box */
          onNodeDragStart={(e, n) => setGhost({ id: n.id, ...resolveDrag(n, e.altKey) })}
          onNodeDrag={(e, n) => setGhost({ id: n.id, ...resolveDrag(n, e.altKey) })}
          onNodeDragStop={(e, n) => {
            setGhost(null)
            // resolve once more rather than trusting state: same inputs, same answer, and
            // the block lands exactly where the ghost was standing
            const { x, y } = resolveDrag(n, e.altKey)
            if (n.id.startsWith('group:')) setGroupPos(n.id.slice(6), { x, y })
            else setNodePos(n.id, { x, y })
          }}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
          fitView
          minZoom={0.15}
        >
          <AlignmentGuides guides={ghost?.guides} />
          {/* the boxes' own extent, so a re-column refits even when the pane size did not change */}
          <FitOnDemand
            tick={`${fitTick}|${boxes.map((b) => `${b.x},${b.y},${b.w},${b.h}`).join(';')}`}
            drawerOpen={!!selectedTech}
          />
          <Background variant={BackgroundVariant.Dots} color="var(--canvas-dot)" gap={24} size={1.4} />
          {added.length > 0 && (
            <Controls showInteractive={false} position="bottom-left" className="!bottom-[4.5rem] !left-[19.5rem]" />
          )}
          {!selectedTech && added.length > 0 && (
            <MiniMap
              pannable
              zoomable
              position="bottom-right"
              className="!bottom-[4.5rem] !right-1"
              nodeColor={minimapColor}
            />
          )}
        </ReactFlow>
      </main>

      <EmptyState show={!added.length} />
      <Overlays analysis={analysis} selectedTech={selectedTech} hovered={hovered} />
    </div>
  )
}

const minimapColor = (n: Node) =>
  n.id.startsWith('group:')
    ? `${groupById.get(n.id.slice(6))?.color ?? ''}55`
    : (techById.get(n.id)?.color ?? 'var(--muted-foreground)')

/**
 * Every line `tech` draws, or would draw once added, to the rest of the stack — phrased from its
 * side ("requires PostgreSQL", "Vitest tests Next.js") for the drawer.
 */
function linksFor(tech: Tech, stack: Tech[]): StackLink[] {
  const withIt = stack.some((t) => t.id === tech.id) ? stack : [...stack, tech]
  return analyze(withIt, stackRules)
    .edges.filter((e) => e.source === tech.id || e.target === tech.id)
    .map((e) => {
      const out = e.source === tech.id
      const other = techById.get(out ? e.target : e.source)?.name ?? ''
      if (e.rel === 'conflicts') return { text: `incompatible with ${other}`, bad: true }
      const { label, both } = REL[e.rel]
      // a two-way line (queries, syncs) has no subject, so it reads the same from either end
      if (both) return { text: `${label} ↔ ${other}`, bad: false }
      return { text: out ? `${label} ${other}` : `${other} ${label} ${tech.name}`, bad: false }
    })
}

/** Every glass panel that floats over the canvas, plus the toasts and the delete guard. */
function Overlays({
  analysis,
  selectedTech,
  hovered,
}: {
  analysis: Analysis
  selectedTech?: Tech
  hovered: string | null
}) {
  const { problems } = analysis
  const [toast, setToast] = useState<string | null>(null)

  const { lastRemoved, undoRemove, dismissUndo, added } = useStack()
  const stack = useMemo(() => added.map((id) => techById.get(id)).filter((t): t is Tech => !!t), [added])
  const lastRemovedName = lastRemoved ? (techById.get(lastRemoved.id)?.name ?? lastRemoved.id) : null
  const problemsOf = (id?: string | null) => (id ? problems.filter((p) => p.techId === id) : [])

  // the undo offer stands for eight seconds, then the removal is final
  useEffect(() => {
    if (!lastRemoved) return
    const t = setTimeout(dismissUndo, 8000)
    return () => clearTimeout(t)
  }, [lastRemoved, dismissUndo])

  return (
    <>
      <TopBar problems={problems} />
      <Palette
        onBlocked={(m) => {
          setToast(m)
          setTimeout(() => setToast(null), 3500)
        }}
      />
      <NeedsPanel analysis={analysis} shifted={!!selectedTech} />
      <AnimatePresence>
        {selectedTech && (
          <Drawer
            key={selectedTech.id}
            tech={selectedTech}
            problems={problemsOf(selectedTech.id)}
            onCanvas={added.includes(selectedTech.id)}
            links={linksFor(selectedTech, stack)}
            blocked={added.includes(selectedTech.id) ? null : blockedBy(selectedTech, stack)}
          />
        )}
      </AnimatePresence>
      <Inspector tech={hovered ? techById.get(hovered) : undefined} problems={problemsOf(hovered)} />

      <Toast message={toast} tone="danger" />
      <Toast
        message={!toast && lastRemovedName ? `Removed ${lastRemovedName}` : null}
        action={
          <Button variant="ghost" size="xs" className="text-link" onClick={undoRemove}>
            Undo
          </Button>
        }
        onDismiss={dismissUndo}
      />
      <DeleteGuard />
    </>
  )
}

/** The first screen: an editorial headline over the empty canvas, gone as soon as a block lands. */
function EmptyState({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-6 bottom-28 left-[21rem] z-[1]"
        >
          <p className="text-caption uppercase text-muted-foreground">Visual stack builder</p>
          <h2 className="mt-3 max-w-4xl text-display text-foreground">
            Forge your stack.
            <span className="block text-subtle-foreground">See what breaks before it ships.</span>
          </h2>
          <p className="mt-4 max-w-md text-body text-muted-foreground">
            Pick a technology from the catalog. StackForge shows what conflicts, what is missing and what connects — in
            your browser, with nothing to sign up for.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  )
}
