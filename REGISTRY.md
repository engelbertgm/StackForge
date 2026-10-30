<!-- Generado por mep (registry). No editar a mano: "Para qué", "No usar para", "Variantes" y @example se escriben en el comentario /** */ de cada export. -->
# Registro de piezas reutilizables

Antes de crear algo, busca aquí. Cada entrada apunta al código; nunca lo copia.

## Componentes

### Aurora
- Ruta: src/components/aurora.tsx
- Para qué: The slow-drifting glow behind the whole app; colours and motion live in index.css.
- Firma: `export function Aurora()`

### BadgeMorph
- Ruta: src/components/ruixen/badge-morph.tsx
- Para qué: A status pill that morphs its width, icon and label between states with springs.
- Firma: `export function BadgeMorph({ status, label, className }: BadgeMorphProps)`

### ClearDialog
- Ruta: src/components/dialogs.tsx
- Para qué: Asks before clearing the canvas. Clear is the one action with no undo behind it — Ctrl+Z only puts back a single removed block — so it names exactly what will be lost.
- Firma: `export function ClearDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void })`

### DeleteGuard
- Ruta: src/components/dialogs.tsx
- Para qué: Asks before removing a block that has account details saved on it.
- Firma: `export function DeleteGuard()`

### Drawer
- Ruta: src/components/drawer.tsx
- Para qué: Right floating drawer for one technology: what it is, licence, pricing and hosting, pros and cons, how it fits the current stack, and — once it is on the canvas — its account details. Opened from a card on the canvas, or from the palette to look before adding.
- Firma: `export function Drawer(`

### Filters
- Ruta: src/components/filters.tsx
- Para qué: The highlight filters in the top bar: build, language, ecosystem and box. One is active at a time.
- Firma: `export function Filters({ highlight, setHighlight }: { highlight: Highlight; setHighlight: SetHighlight })`

### GhostNode
- Ruta: src/components/nodes.tsx
- Para qué: Dashed preview of where a dragged block or box will land.
- Firma: `export function GhostNode({ data }: NodeProps & { data: GhostData })`

### GroupNode
- Ruta: src/components/nodes.tsx
- Para qué: The frosted box that holds one group of technologies, with its section lanes.
- Firma: `export function GroupNode({ data }: NodeProps & { data: GroupData })`

### Inspector
- Ruta: src/components/inspector.tsx
- Para qué: Bottom glass bar describing the hovered block, so a tooltip never covers its neighbours.
- Firma: `export function Inspector({ tech, problems }: { tech?: Tech; problems: Problem[] })`

### Mark
- Ruta: src/components/wordmark.tsx
- Para qué: The square F mark from the favicon, for places too small for the name.
- Firma: `export function Mark({ className }: { className?: string })`

### NeedsPanel
- Ruta: src/components/needs-panel.tsx
- Para qué: Lists what the stack is still missing and the technologies that would fill each gap.
- Firma: `export function NeedsPanel({ analysis, shifted }: { analysis: Analysis; shifted: boolean })`

### Palette
- Ruta: src/components/palette.tsx
- Para qué: Left floating panel: searchable catalog grouped by box; click to add or remove a technology.
- Firma: `export function Palette({ onBlocked }: { onBlocked: (msg: string) => void })`

### ProfileSection
- Ruta: src/components/tech-profile.tsx
- Para qué: Licence, pricing and hosting badges plus pros and cons — or a note when the tech has no profile yet.
- Firma: `export function ProfileSection({ tech }: { tech: Tech })`

### REL
- Ruta: src/components/nodes.tsx
- Para qué: Colour token, label and line style for every relationship type; shared by the wires and the legend.
- Firma: `export const REL: Record<Rel, { stroke: string; label: string; dash?: boolean; both?: boolean }> =`

### RelEdge
- Ruta: src/components/nodes.tsx
- Para qué: Paints one relationship wire along the route planRoutes() chose, with its cardinality marks.
- Firma: `export function RelEdge({ id, markerStart, markerEnd, data }: EdgeProps & { data?: RelEdgeData })`

### StackLinks
- Ruta: src/components/tech-profile.tsx
- Para qué: "In your stack": every line this tech draws (or would draw, before it is added) to what is already on the canvas, and anything it clashes with.
- Firma: `export function StackLinks({ links, onCanvas }: { links: StackLink[]; onCanvas: boolean })`

### TechIcon
- Ruta: src/components/nodes.tsx
- Para qué: A technology's simpleicons.org logo in its own colour, or its initials when there is none. The logo is a mask painted with --ink, so a white or black brand mark stays visible on both themes.
- Firma: `export function TechIcon({ tech, className }: { tech: Tech; className?: string })`

### TechNode
- Ruta: src/components/nodes.tsx
- Para qué: One technology card on the canvas: name, icon, language chips and its problem ring.
- Firma: `export function TechNode({ data }: NodeProps & { data: TechData })`

### ThemeToggle
- Ruta: src/components/theme-toggle.tsx
- Para qué: Sun/moon switch between the light and dark token sets; the icon spins as it swaps.
- Firma: `export function ThemeToggle()`

### Toast
- Ruta: src/components/toast.tsx
- Para qué: A glass pill that springs up from the bottom of the canvas; `message` null hides it.
- Firma: `export function Toast(`

### TopBar
- Ruta: src/components/top-bar.tsx
- Para qué: Floating glass header: the name, the highlight filters, stack status, import/export and theme.
- Firma: `export function TopBar({ problems }: { problems: Problem[] })`

### Wordmark
- Ruta: src/components/wordmark.tsx
- Para qué: The StackForge name: ink "Stack", forge-gradient "Forge" with a slow shimmer.
- Firma: `export function Wordmark({ className }: { className?: string })`

## Hooks

### useTheme
- Ruta: src/lib/theme.ts
- Para qué: Light or dark, remembered per browser; `.dark` on <html> is what every token keys off.
- Firma: `export function useTheme()`

## Utilidades

### cn
- Ruta: src/lib/utils.ts
- Para qué: Class merging that knows the design scale. Out of the box the merger only knows Tailwind's own sizes, so it read `text-micro` as a colour and threw it away whenever a real colour such as `text-muted-foreground` came after it — which is how the search pills ended up at 13px.
- Firma: `export const cn = createCn(`

### tint
- Ruta: src/lib/utils.ts
- Para qué: A technology's or group's own colour is catalog data, not a design token, so it reaches the markup as a CSS variable and the `.tint-*` classes (or `var(--tint)`) paint with it.
- Firma: `export const tint = (thing: { color: string }) => ({ '--tint': thing.color }) as CSSProperties`

## Tipos

### BadgeMorphProps
- Ruta: src/components/ruixen/badge-morph.tsx
- Para qué: Props for BadgeMorph: which state it shows and the words beside the icon.
- Firma: `export interface BadgeMorphProps`

### BadgeStatus
- Ruta: src/components/ruixen/badge-morph.tsx
- Para qué: The five states the status pill can morph between.
- Firma: `export type BadgeStatus = 'idle' | 'loading' | 'success' | 'warning' | 'error'`

### GhostData
- Ruta: src/components/nodes.tsx
- Para qué: Props a GhostNode receives: the colour and label of the thing being dragged.
- Firma: `export interface GhostData extends Record<string, unknown>`

### GroupData
- Ruta: src/components/nodes.tsx
- Para qué: Props a GroupNode box receives from the canvas.
- Firma: `export interface GroupData extends Record<string, unknown>`

### RelEdgeData
- Ruta: src/components/nodes.tsx
- Para qué: Props a RelEdge wire receives: relationship, cardinality and its planned route.
- Firma: `export interface RelEdgeData extends Record<string, unknown>`

### StackLink
- Ruta: src/components/tech-profile.tsx
- Para qué: One relationship with the rest of the stack, already phrased from this tech's point of view.
- Firma: `export interface StackLink`

### TechData
- Ruta: src/components/nodes.tsx
- Para qué: Props a TechNode card receives from the canvas.
- Firma: `export interface TechData extends Record<string, unknown>`

### Theme
- Ruta: src/lib/theme.ts
- Para qué: The two token sets the app can show.
- Firma: `export type Theme = 'light' | 'dark'`
