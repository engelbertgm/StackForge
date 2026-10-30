import type { Build, Group, StackRule, Tech } from '../types'

import groupsJson from './groups.json' with { type: 'json' }
import rulesJson from './rules.json' with { type: 'json' }
import buildsJson from './builds.json' with { type: 'json' }

import language from './language.json' with { type: 'json' }
import frontend from './frontend.json' with { type: 'json' }
import mobile from './mobile.json' with { type: 'json' }
import backend from './backend.json' with { type: 'json' }
import auth from './auth.json' with { type: 'json' }
import data from './data.json' with { type: 'json' }
import ai from './ai.json' with { type: 'json' }
import automation from './automation.json' with { type: 'json' }
import testing from './testing.json' with { type: 'json' }
import devops from './devops.json' with { type: 'json' }
import observability from './observability.json' with { type: 'json' }
import analytics from './analytics.json' with { type: 'json' }
import design from './design.json' with { type: 'json' }
import pm from './pm.json' with { type: 'json' }
import business from './business.json' with { type: 'json' }

/** Add a file here and to the imports above — nothing else needs to change. */
const files = [
  language, frontend, mobile, backend, auth, data, ai, automation,
  testing, devops, observability, analytics, design, pm, business,
]

export const groups = groupsJson as Group[]
export const stackRules = rulesJson as StackRule[]
// each entry lists only its own roles, so TS infers a different shape per build
export const builds = buildsJson as unknown as Build[]
export const techs = files.flat() as unknown as Tech[]

export const techById = new Map(techs.map((t) => [t.id, t]))
export const groupById = new Map(groups.map((g) => [g.id, g]))
export const buildById = new Map(builds.map((b) => [b.id, b]))

/**
 * The part this tech would play in that build, or null if it plays none. First matching role
 * wins, so order the roles in builds.json most-specific first.
 */
export function roleOf(build: Build, tech: Tech): string | null {
  const slot = `${tech.group}:${tech.section}`
  const box = `${tech.group}:*`
  for (const [role, globs] of Object.entries(build.roles))
    if (globs.includes(slot) || globs.includes(box)) return role
  return null
}

/** Every language family and tag actually present, for the filter bar. */
export const allLangs = [...new Set(techs.flatMap((t) => t.langs))].sort()
export const allTags = [...new Set(techs.flatMap((t) => t.tags ?? []))].sort()

// a link or need may name a tech id or a capability; one that matches neither is a typo
const provided = new Set(techs.flatMap((t) => t.provides ?? []))
const exists = (ref: string) => techById.has(ref) || provided.has(ref)

const duplicateIds = () => techs.filter((t, i) => techs.findIndex((o) => o.id === t.id) !== i).map((t) => `duplicate id: ${t.id}`)

/** Why `group:section` names no real slot, or null if it does. `*` stands for the whole box. */
function badSlot(gid: string, section: string): string | null {
  const g = groupById.get(gid)
  if (!g) return `unknown group "${gid}"`
  if (section === '*' || g.sections.includes(section)) return null
  return `"${section}" is not a ${g.name} section`
}

function techErrors(t: Tech): string[] {
  const slot = badSlot(t.group, t.section)
  return [
    ...(slot ? [`${t.id}: ${slot}`] : []),
    ...(t.links ?? []).filter((l) => !exists(l.to)).map((l) => `${t.id}: link target "${l.to}" does not exist`),
    ...(t.conflicts ?? []).filter((c) => !techById.has(c)).map((c) => `${t.id}: conflict target "${c}" does not exist`),
    // a `needs` nothing can satisfy is a typo, not a stack problem
    ...(t.needs ?? []).filter((n) => !exists(n)).map((n) => `${t.id}: needs "${n}" which no tech provides`),
  ]
}

const ruleErrors = (r: StackRule) =>
  [...r.when, ...r.requires].filter((c) => !provided.has(c)).map((c) => `rule ${r.id}: capability "${c}" is never provided`)

// a build glob pointing at a section that does not exist would silently light up nothing
const buildErrors = (b: Build) =>
  Object.entries(b.roles).flatMap(([role, globs]) =>
    globs.flatMap((glob) => {
      const why = badSlot(...(glob.split(':') as [string, string]))
      return why ? [`build ${b.id}/${role}: ${why}`] : []
    }),
  )

/** Catalog integrity — run by catalog.test.ts and logged in dev. */
export function validateCatalog(): string[] {
  return [...duplicateIds(), ...techs.flatMap(techErrors), ...stackRules.flatMap(ruleErrors), ...builds.flatMap(buildErrors)]
}
