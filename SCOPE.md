<!-- Generado por mep desde .mep/profile.yaml. No editar a mano: el scope se cambia con /mep:add. -->
# Scope — stackforge

StackForge is a local-running tool that suggests which technology stack to use based on your needs. You drop technologies on a canvas and it shows conflicts, missing pieces and connections. Everything runs in the browser: no backend, no accounts, no telemetry. It is a suggestion tool, not a SaaS, and has no legal surface. English only.

## Qué es
- **Tipo:** Aplicación interna: herramienta de uso interno detrás de un login
- **Para quién:** por definir
- **Contexto:** Producto propio
- **Mercados:** por definir
- **Tamaño:** ~1 página

## Qué incluye
- Subida de archivos

## Hechos del proyecto
- Formularios largos o editores
- Acciones que borran o cambian datos

## Qué no incluye
- Notificaciones dentro de la app, por email o push
- Búsqueda
- Actualizaciones en tiempo real
- Base de datos propia (no hay datos que guardar)

**Opcionales disponibles, no elegidos:** 2 (ver BRIEF.md).

## Tecnología
- db: none — Nada que guardar: formularios por email, pagos en la página del proveedor, contenido en archivos o en un CMS gestionado. Sin base de datos es más rápido, barato y sin superficie de ataque.
- framework: vite-react, rendering: spa — App interna detrás de login: no necesita SEO ni SSR; Vite es más simple y rápido de construir.
- hosting: vercel — Deploy por git con previews por PR, CDN global, HTTPS automático y soporte de primera para Next.js.
- styling: tailwind, ui: shadcn-ui — Con React: shadcn/ui hereda los tokens del sistema de diseño (variables CSS), así cada componente sale congruente. Sin React: mismos tokens + componentes equivalentes.

## Lo que exige este scope
Aplican **149 de 400** reglas de mep: 🔴 121 obligatorias · 🟡 26 recomendadas · ⚪ 2 opcionales. Las otras 251 no aplican a este scope (`mep explain <id>` dice por qué). El detalle está en BRIEF.md.

**Legales y de cumplimiento obligatorios:**
- Licencias válidas de fuentes, imágenes e íconos
- Propiedad intelectual: aviso de derechos, marcas y cesión al cliente
- Contacto o responsable visible
- Licencias open source de las dependencias revisadas y con atribución

## Fase actual
foundation.setup

## Por definir
- mercados (definen idiomas, legales y moneda)
- audiencia (consumidores, empresas, menores, datos sensibles)

> Checklist orientativo, no sustituye asesoría legal.
