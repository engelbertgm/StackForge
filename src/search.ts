import { groupById } from './catalog/index.ts'
import type { Tech } from './types'

const literal = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** One searchable field and the pill that explains a match on it; `null` means no pill is needed. */
type Field = { text: string; why: string | null }

/**
 * A capability a tech *is* (its first, or the slot it occupies — Prisma and `orm`) reads plain;
 * one it merely *ships with* (Django and `orm`) reads "built-in", so a framework with its own
 * ORM is never mistaken for an ORM.
 */
const capability = (t: Tech, c: string) => (t.exclusive?.includes(c) || t.provides?.[0] === c ? c : `built-in ${c}`)

/**
 * Where a query may match, strongest first. A tech's own name, its box, what it provides and
 * its tags say what it *is*; the section it sits in ("State & Data") and its description only
 * mention things in passing. Searching every field at once is how "data" used to surface
 * Redux and Zustand: their section is called "State & Data".
 * Name and box need no pill — the match is right there on the row, or in the box it sits in.
 */
const TIERS: ((t: Tech) => Field[])[] = [
  (t) => [
    { text: t.name, why: null },
    { text: t.id, why: null },
    { text: groupById.get(t.group)?.name ?? '', why: null },
    ...(t.provides ?? []).map((c) => ({ text: c, why: capability(t, c) })),
    ...(t.tags ?? []).map((g) => ({ text: g, why: `#${g}` })),
  ],
  (t) => [{ text: t.section, why: `in ${t.section}` }],
  (t) => [{ text: t.desc, why: 'in description' }],
]

// a word start is the start of the text or anything that is not a letter or digit, so ".net" and "c#" work too
const startsWord = (text: string, w: string) => new RegExp(`(^|[^a-z0-9])${literal(w)}`).test(text.toLowerCase())

/** Every reason `fields` match the query, or undefined when some word matches nowhere. */
function reasons(fields: Field[], words: string[]): string[] | undefined {
  if (!words.every((w) => fields.some((f) => startsWord(f.text, w)))) return undefined
  const why = fields.filter((f) => words.some((w) => startsWord(f.text, w))).map((f) => f.why)
  return [...new Set(why.filter((w): w is string => w !== null))]
}

/** A search hit and every reason it matched that the row does not already show. */
export interface Hit {
  tech: Tech
  why: string[]
}

/**
 * The palette search: the techs matching in the strongest tier that matches anything at all.
 * A weaker tier is only consulted when the stronger ones come up empty, so descriptions still
 * catch a term no name or capability uses, without drowning out the real answers.
 */
export function searchCatalog(techs: Tech[], query: string): Hit[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return techs.map((tech) => ({ tech, why: [] }))
  for (const fields of TIERS) {
    const found = techs.flatMap((tech) => {
      const why = reasons(fields(tech), words)
      return why ? [{ tech, why }] : []
    })
    if (found.length) return found
  }
  return []
}
