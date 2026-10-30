<!-- Generado por mep (registry). No editar a mano: "Para qué", "No usar para", "Variantes" y @example se escriben en el comentario /** */ de cada export. -->
# Registro de piezas reutilizables

Antes de crear algo, busca aquí. Cada entrada apunta al código; nunca lo copia.

## Componentes

### DeleteGuard
- Ruta: src/components/panels.tsx
- Para qué: Asks before removing a block that has account details saved on it. */
- Firma: `export function DeleteGuard()`

### Drawer
- Ruta: src/components/panels.tsx
- Para qué: Right drawer for the selected block: details, problems and its encrypted account fields. */
- Firma: `export function Drawer({ tech, problems }: { tech: Tech; problems: Problem[] })`

### GhostNode
- Ruta: src/components/nodes.tsx
- Para qué: Dashed preview of where a dragged block or box will land.
- Firma: `export function GhostNode({ data }: NodeProps & { data: GhostData })`

### GroupNode
- Ruta: src/components/nodes.tsx
- Para qué: The coloured box that holds one group of technologies, with its section lanes.
- Firma: `export function GroupNode({ data }: NodeProps & { data: GroupData })`

### Inspector
- Ruta: src/components/panels.tsx
- Para qué: Bottom strip describing the hovered block, so a tooltip never covers its neighbours. */
- Firma: `export function Inspector({ tech, problems }: { tech?: Tech; problems: Problem[] })`

### NeedsPanel
- Ruta: src/components/panels.tsx
- Para qué: Lists what the stack is still missing and the technologies that would fill each gap. */
- Firma: `export function NeedsPanel({ analysis }: { analysis: Analysis })`

### Palette
- Ruta: src/components/panels.tsx
- Para qué: Left sidebar: searchable catalog grouped by box; click to add or remove a technology. */
- Firma: `export function Palette({ onBlocked }: { onBlocked: (msg: string) => void })`

### REL
- Ruta: src/components/nodes.tsx
- Para qué: Colour, label and line style for every relationship type; shared by the wires and the legend. */
- Firma: `export const REL: Record<Rel, { color: string; label: string; dash?: boolean; both?: boolean }> =`

### RelEdge
- Ruta: src/components/nodes.tsx
- Para qué: Paints one relationship wire along the route planRoutes() chose, with its cardinality marks.
- Firma: `export function RelEdge({ id, markerStart, markerEnd, data }: EdgeProps & { data?: RelEdgeData })`

### TechNode
- Ruta: src/components/nodes.tsx
- Para qué: One technology card on the canvas: name, icon, language chips and its problem ring.
- Firma: `export function TechNode({ data }: NodeProps & { data: TechData })`

### TopBar
- Ruta: src/components/panels.tsx
- Para qué: Header with stack status, the highlight filter menu, builds, import/export and clear. */
- Firma: `export function TopBar({ problems }: { problems: Problem[] })`

### UndoToast
- Ruta: src/components/panels.tsx
- Para qué: Offers to put back the block that was just removed. */
- Firma: `export function UndoToast()`

## Tipos

### GhostData
- Ruta: src/components/nodes.tsx
- Para qué: The coloured box that holds one group of technologies, with its section lanes. */ export function GroupNode({ data }: NodeProps & { data: GroupData }) { const group = groupById.get(data.groupId)! return ( <div className="h-full w-full rounded-2xl transition-opacity" style={{ // one box only: black fill, coloured edge, coloured glow. Translucent so wires // crossing underneath stay traceable instead of vanishing. background: 'rgba(4, 6, 9, 0.82)', border: `1px solid ${group.color}66`, boxShadow: `0 0 26px -4px ${group.color}55`, opacity: data.dimmed ? 0.28 : 1, }} > <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ height: GROUP_HEADER, paddingLeft: PAD, color: group.color }} > <span className="h-2 w-2 rounded-full" style={{ background: group.color }} /> {group.name} </div> {data.sections.map((s) => ( <div key={s.name} className="absolute text-[9px] font-semibold uppercase tracking-wider text-white/30" style={{ left: PAD, top: s.y + 6 }} > {s.name} </div> ))} </div> ) } /* ---------- drag ghost ---------- The block you grab never moves. React Flow reports the position it *would* take — already clamped to its parent box — and App renders that spot as this outline. On release the real block is committed here and the ghost goes away.
- Firma: `export interface GhostData extends Record<string, unknown>`

### GroupData
- Ruta: src/components/nodes.tsx
- Para qué: Props a GroupNode box receives from the canvas.
- Firma: `export interface GroupData extends Record<string, unknown>`

### RelEdgeData
- Ruta: src/components/nodes.tsx
- Para qué: Props a RelEdge wire receives: relationship, cardinality and its planned route.
- Firma: `export interface RelEdgeData extends Record<string, unknown>`

### TechData
- Ruta: src/components/nodes.tsx
- Para qué: Props a TechNode card receives from the canvas.
- Firma: `export interface TechData extends Record<string, unknown>`
