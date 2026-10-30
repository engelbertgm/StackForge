<!-- Generado por mep (codemap). Edita solo la sección "Notas manuales"; el resto se regenera. -->
# Mapa del código

Framework: vite-react. Para piezas reutilizables, ver REGISTRY.md.

## Carpetas

| Carpeta | Contiene | No va aquí |
| --- | --- | --- |
| `docs/` | Documentación; decisions/ = ADRs | Código |
| `examples/` | — | — |
| `public/` | Archivos estáticos servidos tal cual (íconos, imágenes, robots) | Imágenes que se optimizan en build, secretos |
| `src/` | — | — |
| `tests/` | Tests de integración y end-to-end | Código de producción |
| `src/catalog/` | — | — |
| `src/components/` | Componentes reutilizables; ui/ = sistema de diseño (shadcn) | Fetch de datos, lógica de negocio, páginas |
| `src/design/` | — | — |
| `src/lib/` | Utilidades y clientes (supabase, stripe, fetchers) | Componentes de UI |

## Puntos de entrada

- **Rutas:** `/`, `/design-system`, `/docs/design/identity-lab`
- **Configuración:** `vite.config.ts`, `components.json`, `tsconfig.json`, `vercel.json`
- **Tokens de diseño:** `src/lib/theme.ts`

## Convenciones

- Ruta nueva: agregarla al router (src/routes o la definición de rutas).
- Componente nuevo: primero REGISTRY.md; si no existe, src/components/.

## Notas manuales

<!-- mep:manual -->
_Lo que el generador no puede inferir: decisiones, atajos, dónde vive algo poco obvio._
<!-- /mep:manual -->
