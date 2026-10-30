/**
 * Orthogonal wire router.
 *
 * React Flow's `getSmoothStepPath` only knows about the two points it is handed, so it
 * happily doubled a wire back over itself when two cards sat closer than its elbow offset,
 * ran straight through whatever card was in between, and gave every wire leaving a card the
 * same exit point. This plans all the wires together instead: it picks which sides to use by
 * cost (length, corners, blocks in the way), hands every wire its own socket on that side,
 * and separates wires that would otherwise share a corridor.
 *
 * No @xyflow import on purpose — this stays plain geometry so it can be unit-tested.
 */

export type Side = 'left' | 'right' | 'top' | 'bottom'
export interface Pt {
  x: number
  y: number
}
export interface Rect {
  x: number
  y: number
  w: number
  h: number
  /** id of the group box this block sits in, so its own box is not treated as an obstacle */
  parent?: string
  /** true for group boxes, which are softer obstacles than the blocks themselves */
  box?: boolean
}
export interface Link {
  id: string
  source: string
  target: string
}

export interface Route {
  sx: number
  sy: number
  tx: number
  ty: number
  path: string
  /** path length, so the travelling dot moves at one speed on long and short wires alike */
  len: number
  /** cardinality mark anchors, already pushed clear of the wire */
  ls: Pt
  lt: Pt
}

/** straight run off a block before the first corner */
const STUB = 18
/** gap between two wires that would otherwise share a corridor */
const LANE = 11
/** extra clearance when a wire has to double back past the block it left, so the detour
 *  reads as a deliberate loop instead of a line hugging the card edge */
const DODGE = 22
/** keep-out ring around a block */
const MARGIN = 7
/** radius of the little hop a wire makes where it crosses another */
const BRIDGE = 4
/** past this many crossings on one wire the hops read as noise, so it stays a plain line */
const MAX_BRIDGES = 6
/** a corner, priced in pixels of extra length */
const BEND = 70
const BLOCK_CARD = 6000
const BLOCK_BOX = 1600
const RADIUS = 10

const SIDES: Side[] = ['top', 'right', 'bottom', 'left']
const DX: Record<Side, number> = { left: -1, right: 1, top: 0, bottom: 0 }
const DY: Record<Side, number> = { left: 0, right: 0, top: -1, bottom: 1 }
const isH = (s: Side) => s === 'left' || s === 'right'
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const near = (a: number, b: number) => Math.abs(a - b) < 0.5

function sidePoint(r: Rect, s: Side, along: number): Pt {
  switch (s) {
    case 'left':
      return { x: r.x, y: r.y + r.h * along }
    case 'right':
      return { x: r.x + r.w, y: r.y + r.h * along }
    case 'top':
      return { x: r.x + r.w * along, y: r.y }
    default:
      return { x: r.x + r.w * along, y: r.y + r.h }
  }
}

/** the range a shared corridor may sit in without either end doubling back over its block */
function interval(pv: number, dp: number, qv: number, dq: number): [number, number] | null {
  let lo = -Infinity,
    hi = Infinity
  for (const [v, d] of [
    [pv, dp],
    [qv, dq],
  ] as const) {
    if (d > 0) lo = Math.max(lo, v)
    if (d < 0) hi = Math.min(hi, v)
  }
  return lo > hi ? null : [lo, hi]
}

const collinear = (a: Pt, b: Pt, c: Pt) => (near(a.x, b.x) && near(b.x, c.x)) || (near(a.y, b.y) && near(b.y, c.y))

function simplify(pts: Pt[]): Pt[] {
  const out: Pt[] = []
  for (const p of pts) {
    const last = out[out.length - 1]
    if (last && near(last.x, p.x) && near(last.y, p.y)) continue
    out.push(p)
  }
  for (let i = out.length - 2; i > 0; i--) if (collinear(out[i - 1], out[i], out[i + 1])) out.splice(i, 1)
  return out
}

/**
 * `corridor` is the one segment of a wire that is free to slide sideways. `v` is where it
 * sits, `min`/`max` how far it may slide before it folds back over a block, and `lo`/`hi` how
 * far it runs — two corridors only need separating if their runs actually overlap.
 */
interface Corridor {
  axis: 'x' | 'y'
  v: number
  min: number
  max: number
  lo: number
  hi: number
}
export interface Wire {
  pts: Pt[]
  corridor?: Corridor
}

const span = (a: number, b: number) => ({ lo: Math.min(a, b), hi: Math.max(a, b) })

/** every ordering of n slots — only ever called with n <= 4 */
function permutations(n: number): number[][] {
  if (n <= 1) return [[0]]
  const out: number[][] = []
  for (const rest of permutations(n - 1))
    for (let i = 0; i <= rest.length; i++) out.push([...rest.slice(0, i), n - 1, ...rest.slice(i)])
  return out
}

/**
 * A wire leaving top/bottom is the mirror image, across the diagonal, of one leaving
 * left/right — so `wire` only solves the sideways case and mirrors the rest through it.
 */
const flip = (p: Pt): Pt => ({ x: p.y, y: p.x })
const FLIP: Record<Side, Side> = { left: 'top', top: 'left', right: 'bottom', bottom: 'right' }
const stub = (a: Pt, s: Side): Pt => ({ x: a.x + DX[s] * STUB, y: a.y + DY[s] * STUB })

/**
 * One wire between two sockets. `lane` overrides the shared corridor's position — that is
 * how two wires running the same way get pulled apart.
 */
export function wire(a: Pt, sa: Side, b: Pt, sb: Side, lane?: number): Wire {
  if (isH(sa)) return wireSideways(a, sa, b, sb, lane)
  const w = wireSideways(flip(a), FLIP[sa], flip(b), FLIP[sb], lane)
  if (!w.corridor) return { pts: w.pts.map(flip) }
  return { pts: w.pts.map(flip), corridor: { ...w.corridor, axis: w.corridor.axis === 'x' ? 'y' : 'x' } }
}

/** `wire` for a source socket on the left or right of its block */
function wireSideways(a: Pt, sa: Side, b: Pt, sb: Side, lane?: number): Wire {
  const p = stub(a, sa)
  const q = stub(b, sb)
  if (!isH(sb)) return oneCorner(a, b, p, q, sa, sb, lane)
  // both sideways: one shared corridor across the middle, or a lane between sides that face apart
  const iv = interval(p.x, DX[sa], q.x, DX[sb])
  return iv ? sharedCorridor(a, b, p, q, iv, lane) : facingApart(a, b, p, q, lane)
}

function sharedCorridor(a: Pt, b: Pt, p: Pt, q: Pt, [min, max]: [number, number], lane?: number): Wire {
  // Both ends leaving the same way puts the ideal corridor exactly on its own bound, i.e.
  // hugging the blocks. Push it clear so the loop looks deliberate.
  let wanted = (p.x + q.x) / 2
  if (max === Infinity) wanted = min + DODGE
  else if (min === -Infinity) wanted = max - DODGE
  const v = clamp(lane ?? wanted, min, max)
  const pts = [a, p, { x: v, y: p.y }, { x: v, y: q.y }, q, b]
  return { pts: simplify(pts), corridor: { axis: 'x', v, min, max, ...span(p.y, q.y) } }
}

// sides face apart: step off both blocks first, then meet on a lane between them
function facingApart(a: Pt, b: Pt, p: Pt, q: Pt, lane?: number): Wire {
  const bounds = span(p.y, q.y)
  const w = clamp(lane ?? (bounds.lo + bounds.hi) / 2, bounds.lo, bounds.hi)
  const pts = [a, p, { x: p.x, y: w }, { x: q.x, y: w }, q, b]
  return { pts: simplify(pts), corridor: { axis: 'y', v: w, min: bounds.lo, max: bounds.hi, ...span(p.x, q.x) } }
}

// one sideways, one up/down: a single corner, when it lies ahead of both ends
function oneCorner(a: Pt, b: Pt, p: Pt, q: Pt, sa: Side, sb: Side, lane?: number): Wire {
  const ahead = (q.x - p.x) * DX[sa] >= 0 && (p.y - q.y) * DY[sb] >= 0
  if (ahead && lane === undefined) return { pts: simplify([a, p, { x: q.x, y: p.y }, q, b]) }

  // otherwise step clear of both blocks and cross on a lane
  const out = DX[sa]
  const v = lane ?? p.x + out * DODGE
  const w = q.y + DY[sb] * STUB
  const pts = [a, p, { x: v, y: p.y }, { x: v, y: w }, { x: q.x, y: w }, q, b]
  const [min, max] = out > 0 ? [p.x, Infinity] : [-Infinity, p.x]
  return { pts: simplify(pts), corridor: { axis: 'x', v, min, max, ...span(p.y, w) } }
}

const overlaps = (a: Pt, b: Pt, r: Rect) =>
  Math.max(a.x, b.x) > r.x - MARGIN &&
  Math.min(a.x, b.x) < r.x + r.w + MARGIN &&
  Math.max(a.y, b.y) > r.y - MARGIN &&
  Math.min(a.y, b.y) < r.y + r.h + MARGIN

type Obstacle = { r: Rect; w: number }

function cost(pts: Pt[], obstacles: Obstacle[]): number {
  let c = (pts.length - 2) * BEND
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1],
      b = pts[i]
    c += Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    for (const o of obstacles) if (overlaps(a, b, o.r)) c += o.w
  }
  return c
}

function length(pts: Pt[]): number {
  let n = 0
  for (let i = 1; i < pts.length; i++) n += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y)
  return n
}

const round = (n: number) => Math.round(n * 100) / 100
const xy = (p: Pt) => round(p.x) + ',' + round(p.y)

/** the arcs a horizontal run from `from` to `stop` makes over the crossings in `hops` */
function hopArcs(from: Pt, stop: Pt, dir: number, hops: Pt[]): string {
  // sweep chosen so the arc always bulges upward, whichever way the wire runs
  const sweep = dir > 0 ? 1 : 0
  return hops
    .filter((h) => near(h.y, from.y) && (h.x - from.x) * dir > BRIDGE && (stop.x - h.x) * dir > BRIDGE)
    .sort((p, q) => (p.x - q.x) * dir)
    .map(
      (h) =>
        'L' +
        xy({ x: h.x - dir * BRIDGE, y: h.y }) +
        'A' +
        BRIDGE +
        ' ' +
        BRIDGE +
        ' 0 0 ' +
        sweep +
        ' ' +
        xy({ x: h.x + dir * BRIDGE, y: h.y }),
    )
    .join('')
}

/** how far short of corner `c` the straight runs stop, so the curve fits both of them */
const cornerRadius = (a: Pt, c: Pt, b: Pt) =>
  Math.min(RADIUS, Math.hypot(c.x - a.x, c.y - a.y) / 2, Math.hypot(b.x - c.x, b.y - c.y) / 2)

/** the point `r` along the way from `a` towards `b` */
function toward(a: Pt, b: Pt, r: number): Pt {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  return { x: a.x + ((b.x - a.x) / len) * r, y: a.y + ((b.y - a.y) / len) * r }
}

/**
 * Rounded orthogonal path; a straight run stays one straight line. `hops` are points where
 * this wire crosses another and should arc over it — the little bridge that tells you the two
 * lines do not meet. Hops are only honoured on horizontal runs, which keeps the choice of who
 * hops over whom consistent across the whole diagram.
 */
export function toPath(pts: Pt[], hops: Pt[] = []): string {
  let d = 'M' + xy(pts[0])
  let from = pts[0]

  for (let i = 1; i < pts.length; i++) {
    const c = pts[i]
    const next = pts[i + 1]
    const r = next ? cornerRadius(pts[i - 1], c, next) : 0
    // where this straight run ends: short of the corner by its radius
    const stop = toward(c, from, r)
    if (from.y === c.y && from.x !== c.x) d += hopArcs(from, stop, Math.sign(c.x - from.x), hops)
    d += 'L' + xy(stop)
    if (!next) break
    from = toward(c, next, r)
    d += 'Q' + xy(c) + ' ' + xy(from)
  }
  return d
}

type Run = { id: string; at: number; lo: number; hi: number }

/** every straight run of every wire, split into horizontal and vertical */
function runs(wires: { id: string; pts: Pt[] }[]) {
  const hs: Run[] = []
  const vs: Run[] = []
  for (const w of wires)
    for (let i = 1; i < w.pts.length; i++) {
      const a = w.pts[i - 1],
        b = w.pts[i]
      if (near(a.y, b.y)) hs.push({ id: w.id, at: a.y, ...span(a.x, b.x) })
      else if (near(a.x, b.x)) vs.push({ id: w.id, at: a.x, ...span(a.y, b.y) })
    }
  return { hs, vs }
}

// a proper crossing only: touching at a shared endpoint is not something to hop over
const strictlyInside = (v: number, r: Run) => v > r.lo + BRIDGE && v < r.hi - BRIDGE
const crosses = (h: Run, v: Run) => v.id !== h.id && strictlyInside(v.at, h) && strictlyInside(h.at, v)

/**
 * Where each wire crosses another. Horizontal runs hop over vertical ones — one rule, applied
 * everywhere, so a crossing never gets two bridges or none.
 */
export function bridges(wires: { id: string; pts: Pt[] }[]): Map<string, Pt[]> {
  const { hs, vs } = runs(wires)
  const out = new Map<string, Pt[]>()
  for (const h of hs) {
    const hops = vs.filter((v) => crosses(h, v)).map((v) => ({ x: v.at, y: h.at }))
    if (hops.length) out.set(h.id, [...(out.get(h.id) ?? []), ...hops])
  }
  // A wire crossing a handful of others reads better with hops. One crossing twenty of them
  // turns into a comb of bumps that hides the line itself — leave those plain.
  for (const [id, hops] of out) if (hops.length > MAX_BRIDGES) out.delete(id)
  return out
}

/** the cardinality mark, pushed along and off the wire so the line never crosses the glyph */
function mark(pts: Pt[], start: boolean): Pt {
  const a = start ? pts[0] : pts[pts.length - 1]
  const b = start ? pts[1] : pts[pts.length - 2]
  const dx = Math.sign(b.x - a.x),
    dy = Math.sign(b.y - a.y)
  return dx !== 0 ? { x: a.x + dx * 16, y: a.y - 7 } : { x: a.x + 10, y: a.y + dy * 16 + 3.5 }
}

/** what planRoutes knows about one wire while it works */
interface Built {
  l: Link
  sa: Side
  sb: Side
  a: Pt
  b: Pt
  w: Wire
  obs: Obstacle[]
}

/**
 * Blocks that are not this wire's own ends are obstacles; group boxes are softer obstacles,
 * except the two the wire's ends live in.
 */
function obstaclesFor(rects: Map<string, Rect>, l: Link): Obstacle[] {
  const ends = [l.source, l.target]
  const homes = [rects.get(l.source)?.parent, rects.get(l.target)?.parent]
  return [...rects]
    .filter(([id, r]) => !(r.box ? homes : ends).includes(id))
    .map(([, r]) => ({ r, w: r.box ? BLOCK_BOX : BLOCK_CARD }))
}

/** which side of each block to use — decided by what the wire would actually cost */
function cheapestSides(A: Rect, B: Rect, obs: Obstacle[]): { sa: Side; sb: Side } {
  let best: { sa: Side; sb: Side } = { sa: 'right', sb: 'left' }
  let bestCost = Infinity
  for (const sa of SIDES)
    for (const sb of SIDES) {
      const c = cost(wire(sidePoint(A, sa, 0.5), sa, sidePoint(B, sb, 0.5), sb).pts, obs)
      if (c < bestCost - 0.001) {
        bestCost = c
        best = { sa, sb }
      }
    }
  return best
}

/**
 * One socket per wire on each side, ordered by where the far end lies, so wires leaving the
 * same block neither share a point nor cross each other on the way out. Keyed `<link id>|a|b`.
 */
function sockets(rects: Map<string, Rect>, live: Link[], chosen: Map<string, { sa: Side; sb: Side }>) {
  const buckets = new Map<string, { id: string; key: number }[]>()
  const add = (node: string, side: Side, other: Rect, id: string) => {
    const k = node + '|' + side
    const key = isH(side) ? other.y + other.h / 2 : other.x + other.w / 2
    buckets.set(k, [...(buckets.get(k) ?? []), { id, key }])
  }
  for (const l of live) {
    const { sa, sb } = chosen.get(l.id)!
    add(l.source, sa, rects.get(l.target)!, l.id + '|a')
    add(l.target, sb, rects.get(l.source)!, l.id + '|b')
  }

  const along = new Map<string, number>()
  for (const list of buckets.values()) {
    list.sort((x, y) => x.key - y.key || x.id.localeCompare(y.id))
    for (const [i, e] of list.entries()) along.set(e.id, (i + 1) / (list.length + 1))
  }
  return along
}

/** grow a cluster from `i` while the next corridor is within a lane AND its run overlaps one already in */
function clusterAt(onAxis: Built[], i: number): Built[] {
  const cluster = [onAxis[i]]
  for (const next of onAxis.slice(i + 1)) {
    const c = next.w.corridor!
    const close = c.v - cluster[cluster.length - 1].w.corridor!.v < LANE
    const overlapping = cluster.some((e) => c.lo < e.w.corridor!.hi && c.hi > e.w.corridor!.lo)
    if (!close || !overlapping) break
    cluster.push(next)
  }
  return cluster
}

/** the lanes a cluster spreads into — a corridor pinned on one side can only spread away from that side */
function lanesFor(cluster: Built[]): number[] {
  const upOnly = cluster.every((e) => e.w.corridor!.max === Infinity)
  const downOnly = cluster.every((e) => e.w.corridor!.min === -Infinity)
  const vs = cluster.map((e) => e.w.corridor!.v)
  const step = downOnly ? -LANE : LANE
  let from = (Math.min(...vs) + Math.max(...vs)) / 2 - (step * (cluster.length - 1)) / 2
  if (upOnly) from = Math.max(...vs)
  else if (downOnly) from = Math.min(...vs)
  return cluster.map((_, n) => from + n * step)
}

/** crossings, tie-broken on total length so a pointless reshuffle keeps the tidier layout */
function score(wires: { id: string; pts: Pt[] }[], made: Pt[][]): number {
  let s = 0
  for (const hops of bridges(wires).values()) s += hops.length
  for (const pts of made) s += length(pts) / 100000
  return s
}

/*
 * Which wire gets which lane decides whether they cross. Two wires leaving the same
 * block and peeling off at different heights only stay apart if the one travelling
 * furthest takes the lane nearest its source — put them the other way round and the
 * shorter one has to cut across the longer one's corridor. Rather than encode that as a
 * rule, try the orderings and keep the one that actually crosses least.
 * ponytail: brute force, capped at 4 wires a cluster (24 orders); needs a real bus
 * router only if clusters ever get big enough for that to show up in a frame.
 */
function spread(cluster: Built[], built: Built[]) {
  const slots = lanesFor(cluster)
  const rest = built.filter((e) => !cluster.includes(e)).map((e) => ({ id: e.l.id, pts: e.w.pts }))
  const orders = cluster.length <= 4 ? permutations(cluster.length) : [cluster.map((_, n) => n)]
  // a lane that shoves a wire into a block is never worth a saved crossing
  const intoBlock = (pts: Pt[], e: Built) => cost(pts, e.obs) > cost(e.w.pts, e.obs) + LANE * 4

  let bestPts: Pt[][] | null = null
  let bestScore = Infinity
  for (const order of orders) {
    const made = cluster.map((e, n) => wire(e.a, e.sa, e.b, e.sb, slots[order[n]]).pts)
    if (made.some((pts, n) => intoBlock(pts, cluster[n]))) continue
    const s = score([...rest, ...made.map((pts, n) => ({ id: cluster[n].l.id, pts }))], made)
    if (s < bestScore) {
      bestScore = s
      bestPts = made
    }
  }
  const won = bestPts
  if (won)
    cluster.forEach((e, n) => {
      e.w = { ...e.w, pts: won[n] }
    })
}

/*
 * Pull apart corridors that run alongside each other. Bucketing by `round(v / LANE)` missed
 * pairs that straddled a bucket edge, and spreading symmetrically around the mean was undone
 * by the clamp whenever a corridor could only move one way — two wires 5px apart stayed 5px
 * apart. Cluster by real proximity instead, and spread in the direction they can actually go.
 */
function separate(built: Built[], axis: 'x' | 'y') {
  const onAxis = built.filter((e) => e.w.corridor?.axis === axis).sort((p, q) => p.w.corridor!.v - q.w.corridor!.v)
  for (let i = 0; i < onAxis.length; ) {
    const cluster = clusterAt(onAxis, i)
    i += cluster.length
    if (cluster.length > 1) spread(cluster, built)
  }
}

/** Plans every wire at once, so wires share the space between blocks instead of fighting over it. */
export function planRoutes(rects: Map<string, Rect>, links: Link[]): Map<string, Route> {
  const live = links.filter((l) => rects.has(l.source) && rects.has(l.target))
  const obs = new Map(live.map((l) => [l.id, obstaclesFor(rects, l)]))
  const chosen = new Map(
    live.map((l) => [l.id, cheapestSides(rects.get(l.source)!, rects.get(l.target)!, obs.get(l.id)!)]),
  )
  const along = sockets(rects, live, chosen)

  // build the wires, then pull apart any that ended up sharing a corridor
  const built: Built[] = live.map((l) => {
    const { sa, sb } = chosen.get(l.id)!
    const a = sidePoint(rects.get(l.source)!, sa, along.get(l.id + '|a') ?? 0.5)
    const b = sidePoint(rects.get(l.target)!, sb, along.get(l.id + '|b') ?? 0.5)
    return { l, sa, sb, a, b, w: wire(a, sa, b, sb), obs: obs.get(l.id)! }
  })
  separate(built, 'x')
  separate(built, 'y')

  const hops = bridges(built.map((e) => ({ id: e.l.id, pts: e.w.pts })))
  const route = (e: Built): Route => ({
    sx: e.a.x,
    sy: e.a.y,
    tx: e.b.x,
    ty: e.b.y,
    path: toPath(e.w.pts, hops.get(e.l.id)),
    len: length(e.w.pts),
    ls: mark(e.w.pts, true),
    lt: mark(e.w.pts, false),
  })
  return new Map(built.map((e) => [e.l.id, route(e)]))
}
