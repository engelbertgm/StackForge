import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { analyze, blockedBy, fixesFor } from '../rules.ts'
import { groups, stackRules, techById, techs, validateCatalog } from './index.ts'

const pick = (...ids: string[]) => ids.map((id) => techById.get(id)!)

test('catalog is internally consistent', () => {
  assert.deepEqual(validateCatalog(), [])
})

test('catalog is not empty', () => {
  assert.ok(techs.length > 150, 'expected a broad catalog, got ' + techs.length)
  assert.equal(groups.length, 15)
  assert.ok(stackRules.length > 0)
})

test('Supabase is the backend: a Supabase web stack asks for no server', () => {
  const a = analyze(pick('nextjs', 'supabase', 'vercel', 'rls', 'stripe', 'openai', 'crisp', 'klaviyo', 'resend'), stackRules)
  assert.deepEqual(a.problems.filter((p) => p.severity === 'error'), [])
  assert.deepEqual(a.missing.map((m) => m.cap).sort(), ['monitoring', 'test-unit'])

  // Supabase alone points at the one thing it cannot do for you
  assert.deepEqual(analyze(pick('supabase'), stackRules).missing.map((m) => m.cap).sort(), ['rls', 'test-unit'])
})

test('a queue that needs a long-lived worker still asks for one on Supabase', () => {
  const a = analyze(pick('supabase', 'bullmq', 'redis'), stackRules)
  assert.ok(a.missing.some((m) => m.cap === 'js-runtime' && m.neededBy.includes('bullmq')))
  assert.ok(!analyze(pick('supabase', 'inngest', 'triggerdev', 'qstash'), stackRules).missing.some((m) => m.cap !== 'test-unit' && m.cap !== 'rls'))
})

test('tools that are used together are not forced to compete for a slot', () => {
  const pairs = [['clerk', 'supabase'], ['klaviyo', 'resend'], ['paypal', 'stripe']]
  for (const [a, b] of pairs) assert.equal(blockedBy(techById.get(a)!, pick(b)), null, `${a} + ${b}`)
})

test('recommendations for a TypeScript web stack stay in TypeScript', () => {
  const stack = pick('react', 'vite', 'supabase')
  assert.deepEqual(fixesFor('test-unit', stack, techs).slice(0, 3).map((t) => t.id), ['vitest', 'jest', 'bun'])
  assert.equal(fixesFor('db-sql', pick('medusa'), techs)[0].id, 'postgresql')
})

test('GitHub Actions draws a line to what it runs and where it deploys', () => {
  const { edges } = analyze(pick('git', 'github', 'githubactions', 'typescript', 'react', 'vite', 'eslint', 'vitest', 'playwright', 'vercel'), stackRules)
  const from = edges.filter((e) => e.source === 'githubactions').map((e) => `${e.target}:${e.rel}`).sort()
  assert.deepEqual(from, ['eslint:automates', 'github:extends', 'playwright:automates', 'typescript:automates', 'vercel:deploys', 'vitest:automates'])
})
