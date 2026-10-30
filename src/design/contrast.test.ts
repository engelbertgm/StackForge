/**
 * WCAG contrast for every text/background token pair, in both themes, read straight from
 * index.css. A token edit that drops a pair below AA fails `pnpm check` instead of shipping.
 * Translucent surfaces (glass) are composited over the page background first, which is the
 * worst case: the aurora behind them only ever adds a faint tint.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `no ${selector} block in index.css`)
  const body = css.slice(start, css.indexOf('\n}', start))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const light = block(':root')
const dark = { ...light, ...block('.dark') }

type RGBA = [number, number, number, number]

function resolve(tokens: Record<string, string>, name: string): string {
  let v = tokens[name]
  assert.ok(v, `token --${name} is not defined`)
  for (let i = 0; i < 10 && v.startsWith('var('); i++) v = tokens[v.slice(6, -1)]
  return v
}

/** oklch(L C H / A) → linear sRGB, clamped to the gamut */
function oklch(value: string): RGBA {
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/)
  assert.ok(m, `cannot parse colour "${value}"`)
  const [L, C, H, A = '1'] = m.slice(1)
  const h = (Number(H) * Math.PI) / 180
  const a = Number(C) * Math.cos(h)
  const b = Number(C) * Math.sin(h)
  const l = (Number(L) + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (Number(L) - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (Number(L) - 0.0894841775 * a - 1.291485548 * b) ** 3
  const c = (x: number) => Math.min(1, Math.max(0, x))
  return [
    c(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s),
    c(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s),
    c(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s),
    Number(A),
  ]
}

const over = (top: RGBA, under: RGBA): RGBA =>
  [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3])).concat(1) as RGBA
const luminance = ([r, g, b]: RGBA) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function contrast(tokens: Record<string, string>, fg: string, bg: string): number {
  const page = oklch(resolve(tokens, 'background'))
  const back = over(oklch(resolve(tokens, bg)), page)
  const front = over(oklch(resolve(tokens, fg)), back)
  const [hi, lo] = [luminance(front), luminance(back)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const TEXT = 4.5
const LARGE = 3 // ≥ 18px semibold text, icons, focus rings and wires

const surfaces = ['background', 'card', 'glass', 'glass-strong', 'popover', 'muted']
const pairs: [fg: string, bg: string, min: number][] = [
  ...surfaces.flatMap((s): [string, string, number][] => [
    ['foreground', s, TEXT],
    ['muted-foreground', s, TEXT],
  ]),
  ...['background', 'card', 'glass-strong'].flatMap((s): [string, string, number][] => [
    ['destructive', s, TEXT],
    ['warning', s, TEXT],
    ['success', s, TEXT],
    ['link', s, TEXT],
    ['subtle-foreground', s, LARGE],
    ['ring', s, LARGE],
    ['text-forge-1', s, LARGE],
    ['text-forge-2', s, LARGE],
    ['text-forge-3', s, LARGE],
  ]),
  ['foreground', 'accent', TEXT],
  ['primary-foreground', 'primary', TEXT],
  // the Ember pill is a gradient: white has to hold on every stop of it
  ['primary-foreground', 'forge-deep-1', TEXT],
  ['primary-foreground', 'forge-deep-2', TEXT],
  ['primary-foreground', 'forge-deep-3', TEXT],
  ...[
    'extends',
    'tests',
    'styles',
    'types',
    'monitors',
    'requires',
    'consumes',
    'queries',
    'deploys',
    'automates',
    'conflicts',
  ].map((r): [string, string, number] => [`rel-${r}`, 'background', LARGE]),
]

for (const [theme, tokens] of [
  ['light', light],
  ['dark', dark],
] as const) {
  test(`${theme} theme meets WCAG AA for every token pair`, () => {
    const failures = pairs
      .map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(tokens, fg, bg) }))
      .filter((p) => p.ratio < p.min)
      .map((p) => `--${p.fg} on --${p.bg}: ${p.ratio.toFixed(2)}:1 (needs ${p.min}:1)`)
    assert.deepEqual(failures, [])
  })
}
