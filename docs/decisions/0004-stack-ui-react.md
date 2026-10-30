# Stack: styling: tailwind, ui: shadcn-ui

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto
Perfil: internal-app; capacidades: uploads. Regla: ui-react.

## Decisión
**Decisión:** styling: tailwind, ui: shadcn-ui

Con React: shadcn/ui hereda los tokens del sistema de diseño (variables CSS), así cada componente sale congruente. Sin React: mismos tokens + componentes equivalentes.

## Alternativas
- —

## Consecuencias
Cambiarla requiere actualizar `.mep/profile.yaml`, regenerar el brief y un ADR nuevo que reemplace a este.
