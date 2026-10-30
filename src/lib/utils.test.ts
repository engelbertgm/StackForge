import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cn } from './utils.ts'

test('a design-scale size and a text colour both survive the merge', () => {
  for (const size of ['text-display', 'text-h2', 'text-body', 'text-small', 'text-caption', 'text-micro']) {
    const merged = cn(size, 'text-muted-foreground').split(' ')
    assert.ok(merged.includes(size), `${size} was dropped`)
    assert.ok(merged.includes('text-muted-foreground'), `colour was dropped next to ${size}`)
  }
})

test('two sizes still collapse to the last one', () => {
  assert.equal(cn('text-micro', 'text-small'), 'text-small')
})
