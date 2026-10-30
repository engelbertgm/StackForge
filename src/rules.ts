import type { Link, Problem, StackRule, Tech } from './types'

export interface Analysis {
  problems: Problem[]
  /** resolved arrows between selected techs — one per pair of blocks */
  edges: {
    id: string
    source: string
    target: string
    rel: Link['rel']
    card?: Link['card']
    /** the two blocks depend on each other: one line, an arrowhead at each end */
    both?: boolean
  }[]
  /** every capability the selection supplies */
  caps: Set<string>
  /** capabilities the stack is asking for but nobody supplies */
  missing: { cap: string; neededBy: string[] }[]
}

const pair = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Does `t` meet this need? A need names a capability, or a tech id when only that one product
 * will do: Supabase Edge Functions need Supabase itself, not any database.
 */
const supplies = (t: Tech, need: string) => t.id === need || !!t.provides?.includes(need)

/**
 * What would fill a gap, best first. Cheapest is a single-purpose tool, in a language the stack
 * already speaks, that opens no new gap of its own. Without this a missing `orm` offered Django,
 * Laravel, Rails and Spring ahead of Prisma, and missing error tracking offered Langfuse.
 */
export function fixesFor(need: string, selected: Tech[], catalog: Tech[], limit = 4): Tech[] {
  const on = new Set(selected.map((t) => t.id))
  const langs = new Set(selected.flatMap((t) => t.langs).filter((l) => l !== 'none'))
  const cost = (t: Tech) =>
    2 * (t.provides?.length ?? 0) +
    (t.langs.some((l) => langs.has(l)) ? 0 : 10) +
    10 * (t.needs ?? []).filter((n) => !selected.some((s) => supplies(s, n))).length
  return catalog
    .filter((t) => !on.has(t.id) && supplies(t, need) && !blockedBy(t, selected))
    .sort((a, b) => cost(a) - cost(b))
    .slice(0, limit)
}

/** Why `candidate` cannot join `selected`, or null if it can. */
export function blockedBy(candidate: Tech, selected: Tech[]): string | null {
  for (const s of selected) {
    if (s.id === candidate.id) continue
    if (candidate.conflicts?.includes(s.id) || s.conflicts?.includes(candidate.id))
      return `${candidate.name} is not compatible with ${s.name}`
    const clash = candidate.exclusive?.find((k) => s.exclusive?.includes(k))
    if (clash) return `${candidate.name} and ${s.name} both fill the "${clash}" slot — pick one`
  }
  return null
}

/** What analyze() accumulates while it walks the selection. */
interface Acc {
  problems: Problem[]
  edges: Analysis['edges']
  seenEdge: Set<string>
  seenConflict: Set<string>
  missing: Map<string, string[]>
}

function push(acc: Acc, source: string, target: string, rel: Link['rel'], card?: Link['card']) {
  const id = `${source}->${target}:${rel}`
  if (acc.seenEdge.has(id)) return
  acc.seenEdge.add(id)
  acc.edges.push({ id, source, target, rel, card })
}

const addMissing = (acc: Acc, cap: string, ids: string[]) =>
  acc.missing.set(cap, [...(acc.missing.get(cap) ?? []), ...ids])

// explicit arrows, only when the other end is on the canvas. Like a need, a link may name a
// capability: GitHub Actions runs whichever linter you picked, not one fixed product
function drawLinks(acc: Acc, t: Tech, selected: Tech[]) {
  for (const l of t.links ?? [])
    for (const o of selected) if (o.id !== t.id && supplies(o, l.to)) push(acc, t.id, o.id, l.rel, l.card)
}

// A need is a real dependency: draw it to every provider, because that is the
// relationship the user is trying to see. Many needers, one provider -> n-1.
function checkNeeds(acc: Acc, t: Tech, selected: Tech[]) {
  for (const need of t.needs ?? []) {
    const providers = selected.filter((o) => o.id !== t.id && supplies(o, need))
    for (const p of providers) push(acc, t.id, p.id, 'requires', 'n-1')
    if (providers.length) continue
    acc.problems.push({ techId: t.id, severity: 'error', message: `Missing: nothing in this stack provides "${need}"` })
    addMissing(acc, need, [t.id])
  }
}

// incompatibilities, reported on both blocks but drawn once
function checkConflicts(acc: Acc, t: Tech, selected: Tech[]) {
  for (const other of selected) {
    if (other.id === t.id) continue
    const explicit = t.conflicts?.includes(other.id)
    const clash = t.exclusive?.find((k) => other.exclusive?.includes(k))
    if (!explicit && !clash) continue
    acc.problems.push({
      techId: t.id,
      severity: 'error',
      message: explicit
        ? `${t.name} is not compatible with ${other.name}`
        : `${t.name} and ${other.name} both fill the "${clash}" slot`,
    })
    const key = pair(t.id, other.id)
    if (acc.seenConflict.has(key)) continue
    acc.seenConflict.add(key)
    push(acc, t.id, other.id, 'conflicts')
  }
}

// stack-wide completeness (self-hosted with no DB, users with no auth, RAG with no vector store, ...)
function applyStackRule(acc: Acc, r: StackRule, selected: Tech[], caps: Set<string>) {
  if (!r.when.every((c) => caps.has(c))) return
  const blame = selected.filter((t) => t.provides?.some((c) => r.when.includes(c)))
  const satisfied = r.requires.filter((c) => caps.has(c))

  if (!satisfied.length) {
    for (const t of blame) acc.problems.push({ techId: t.id, severity: r.severity, message: r.message })
    // one of `requires` would satisfy the rule — offer them all as candidates
    addMissing(
      acc,
      r.requires[0],
      blame.map((t) => t.id),
    )
    return
  }
  // the rule describes a real dependency — now that both ends are present, draw it.
  // This is why adding Pinecone finally wires LangChain to it.
  const providers = satisfied.flatMap((cap) => selected.filter((o) => o.provides?.includes(cap)))
  for (const provider of providers)
    for (const t of blame) if (t.id !== provider.id) push(acc, t.id, provider.id, 'requires', 'n-1')
}

export function analyze(selected: Tech[], stackRules: StackRule[]): Analysis {
  const caps = new Set(selected.flatMap((t) => t.provides ?? []))
  const acc: Acc = { problems: [], edges: [], seenEdge: new Set(), seenConflict: new Set(), missing: new Map() }

  for (const t of selected) {
    drawLinks(acc, t, selected)
    checkNeeds(acc, t, selected)
    checkConflicts(acc, t, selected)
  }
  for (const r of stackRules) applyStackRule(acc, r, selected, caps)

  return {
    problems: acc.problems,
    edges: mergePairs(acc.edges),
    caps,
    missing: [...acc.missing].map(([cap, neededBy]) => ({ cap, neededBy: [...new Set(neededBy)] })),
  }
}

/** An explicit relationship beats one merely derived from a capability. A conflict beats both. */
const rank = (r: Link['rel']) => (r === 'conflicts' ? 3 : r === 'requires' || r === 'consumes' ? 1 : 2)

/**
 * Two blocks get exactly one line. If each depends on the other, that line carries an
 * arrowhead at both ends rather than two separate arrows lying on top of each other.
 */
function mergePairs(edges: Analysis['edges']): Analysis['edges'] {
  const byPair = new Map<string, Analysis['edges'][number]>()

  for (const e of edges) {
    const key = pair(e.source, e.target)
    const prev = byPair.get(key)
    if (!prev) {
      byPair.set(key, { ...e, id: `${key}:${e.rel}` })
      continue
    }
    const winner = rank(e.rel) > rank(prev.rel) ? e : prev
    byPair.set(key, {
      ...winner,
      id: `${key}:${winner.rel}`,
      // opposing directions collapse into one bidirectional line
      both: prev.both || winner.both || prev.source !== e.source,
    })
  }

  return [...byPair.values()]
}
