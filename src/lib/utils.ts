import { createCn } from 'cn/config'
import type { CSSProperties } from 'react'

/**
 * Class merging that knows the design scale. Out of the box the merger only knows Tailwind's
 * own sizes, so it read `text-micro` as a colour and threw it away whenever a real colour such
 * as `text-muted-foreground` came after it — which is how the search pills ended up at 13px.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body', 'small', 'caption', 'micro'] }],
    },
  },
})

/**
 * A technology's or group's own colour is catalog data, not a design token, so it reaches
 * the markup as a CSS variable and the `.tint-*` classes (or `var(--tint)`) paint with it.
 */
export const tint = (thing: { color: string }) => ({ '--tint': thing.color }) as CSSProperties
