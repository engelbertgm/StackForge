# Stack: framework: vite-react, rendering: spa

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto
Perfil: internal-app; capacidades: uploads. Regla: framework-spa-internal.

## Decisión
**Decisión:** framework: vite-react, rendering: spa

App interna detrás de login: no necesita SEO ni SSR; Vite es más simple y rápido de construir.

## Alternativas
- framework: nextjs — when: si después se necesitan rutas públicas o API propia

## Consecuencias
Cambiarla requiere actualizar `.mep/profile.yaml`, regenerar el brief y un ADR nuevo que reemplace a este.
