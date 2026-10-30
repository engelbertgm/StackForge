# Stack: hosting: vercel

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto
Perfil: internal-app; capacidades: uploads. Regla: hosting-vercel.

## Decisión
**Decisión:** hosting: vercel

Deploy por git con previews por PR, CDN global, HTTPS automático y soporte de primera para Next.js.

## Alternativas
- hosting: netlify — when: si el cliente ya opera ahí

## Consecuencias
Cambiarla requiere actualizar `.mep/profile.yaml`, regenerar el brief y un ADR nuevo que reemplace a este.
