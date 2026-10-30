import assert from 'node:assert/strict'
import { test } from 'node:test'
import { techs } from './catalog/index.ts'
import { searchCatalog } from './search.ts'

const ids = (q: string) => searchCatalog(techs, q).map((h) => h.tech.id)
const whyOf = (q: string, id: string) => searchCatalog(techs, q).find((h) => h.tech.id === id)?.why

test('"orm" finds query layers, not every description that says platform or performance', () => {
  const found = ids('orm')
  assert.ok(found.includes('prisma'), 'Prisma provides orm')
  assert.ok(found.includes('drizzle'), 'Drizzle provides orm')
  for (const noise of ['rust', 'csharp', 'angular', 'solid', 'zod'])
    assert.ok(!found.includes(noise), `${noise} matched "orm"`)
})

test('"data" finds the Data box, not state libraries whose section merely says "State & Data"', () => {
  const found = ids('data')
  assert.ok(found.includes('postgresql'), 'the Data & Storage box')
  for (const noise of ['redux', 'zustand', 'jotai', 'mobx'])
    assert.ok(!found.includes(noise), `${noise} matched "data"`)
})

test('descriptions are a fallback: a term only a description uses still finds something', () => {
  const descOnly = techs.find((t) => /\bmigrations\b/i.test(t.desc))
  assert.ok(descOnly && ids('migrations').includes(descOnly.id))
})

test('every word of a multi-word query has to match', () => {
  assert.ok(ids('supabase edge').includes('supabasefunctions'))
  assert.ok(!ids('supabase edge').includes('supabase'))
})

test('symbols in a query are taken literally', () => {
  assert.doesNotThrow(() => ids('c++ (*'))
  assert.ok(ids('.net').length > 0)
})

test('each hit lists every reason it matched, and says when a capability is only built in', () => {
  assert.deepEqual(whyOf('orm', 'prisma'), ['orm'])
  assert.deepEqual(whyOf('orm', 'django'), ['built-in orm'])
  assert.ok(whyOf('data', 'tanstackquery')?.includes('data-fetching'))
  assert.deepEqual(whyOf('prisma', 'prisma'), []) // the name already says it
  assert.deepEqual(whyOf('data', 'postgresql'), []) // so does its box, Data & Storage
})
