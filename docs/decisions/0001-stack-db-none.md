# Stack: db: none

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto
Perfil: internal-app; capacidades: uploads. Regla: db-none.

## Decisión
**Decisión:** db: none

Nada que guardar: formularios por email, pagos en la página del proveedor, contenido en archivos o en un CMS gestionado. Sin base de datos es más rápido, barato y sin superficie de ataque.

## Alternativas
- —

## Consecuencias
Cambiarla requiere actualizar `.mep/profile.yaml`, regenerar el brief y un ADR nuevo que reemplace a este.
