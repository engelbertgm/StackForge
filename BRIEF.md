<!-- Generado por mep desde .mep/profile.yaml (catálogo 2026.10.7). No editar a mano: usa /mep:add, /mep:skip, /mep:override. -->
# Brief — stackforge

> El resumen del scope en lenguaje claro está en [SCOPE.md](SCOPE.md).

## Perfil
- **Tipo:** internal-app
- **Capacidades:** uploads
- **Mercados:** —
- **Audiencia:** —
- **Contexto:** own-product
- **Señales:** has_long_forms, has_destructive_actions, team=solo
- **Conteos:** pages 1 · entities 0 · languages 1 · integrations 0

## Stack (decisión + por qué)
- **db:** none _(recomendado)_ — Nada que guardar: formularios por email, pagos en la página del proveedor, contenido en archivos o en un CMS gestionado. Sin base de datos es más rápido, barato y sin superficie de ataque.
- **framework:** vite-react · **rendering:** spa _(recomendado)_ — App interna detrás de login: no necesita SEO ni SSR; Vite es más simple y rápido de construir.
- **hosting:** vercel _(recomendado)_ — Deploy por git con previews por PR, CDN global, HTTPS automático y soporte de primera para Next.js.
- **styling:** tailwind _(recomendado)_ · **ui:** shadcn-ui _(recomendado)_ — Con React: shadcn/ui hereda los tokens del sistema de diseño (variables CSS), así cada componente sale congruente. Sin React: mismos tokens + componentes equivalentes.

## Fase actual
- **Cerradas:** —
- **Activa:** foundation.setup

## Checklist

### foundation.setup ← activa

#### 🔴 Obligatorios
- [ ] `adr-log` — Registro de decisiones (ADR) en docs/decisions/ — existe docs/decisions/*.md
- [ ] `build-lint-typecheck` — Build, lint y type-check pasan — package.json → scripts.build · package.json → scripts.typecheck · `pnpm -s typecheck` sale con 0
- [ ] `code-maps` — CODEMAP.md y REGISTRY.md existen y están al día — CODEMAP.md al día · REGISTRY.md al día (mep registry --check)
- [ ] `code-principles` — Mantra: simple primero, reutilizar antes de crear, una responsabilidad, nombres que explican, consistencia, boy scout — contiene /Mantra de código/ en CLAUDE.md
- [ ] `code-structure` — Carpetas por feature o dominio con convención documentada; UI solo del sistema; un patrón de errores — contiene /^#+\s*(Estructura|Structure|Convenciones|Conventions)/ en README.md
- [ ] `dependency-scan-ci` — Escaneo de dependencias en CI que falla con críticas — contiene /\baudit\b|osv-scanner|socket/ en .github/workflows/*.{yml,yaml}
- [ ] `env-example` — .env.example sin valores reales — existe .env.example
- [ ] `env-gitignored` 🔒 — .env* en .gitignore (excepto .env.example) — contiene /^\.env/ en .gitignore · sin /=\s*(sk_live_|sk_test_|whsec_|eyJ[A-Za-z0-9_-]{20,}|[A-Za-z0-9+/]{40,})/ en .env.example
- [ ] `formatter` — Formato automático (Prettier o equivalente) sin diferencias — existe .prettierrc o .prettierrc.json o .prettierrc.js o .prettierrc.mjs o prettier.config.js o prettier.config.mjs o biome.json o biome.jsonc
- [x] `gitignore` — .gitignore con dependencias y build — contiene /node_modules/ en .gitignore
- [ ] `lockfile-committed` — Lockfile versionado — existe pnpm-lock.yaml o package-lock.json o yarn.lock o bun.lockb o bun.lock
- [ ] `no-critical-vulnerabilities` — Sin vulnerabilidades críticas en dependencias — `if [ -f pnpm-lock.yaml ]; then pnpm audit --audit-level critical --prod; elif [ -f yarn.lock ]; then yarn npm audit --severity critical; else npm audit --audit-level=critical --omit=dev; fi` sale con 0
- [x] `no-debug-leftovers` — Sin console.log, código comentado ni TODO sin referencia (shortcut: de Ponytail permitido) — sin /console\.log\(/ en {app,src,components,lib,hooks,services,utils}/**/*.{ts,tsx,js,jsx} · sin /\b(TODO|FIXME|XXX)\b(?!\s*[(:]?\s*(#\d+|[A-Z][A-Z0-9]+-\d+|https?://))/ en {app,src,components,lib,hooks,services,utils}/**/*.{ts,tsx,js,jsx}
- [ ] `no-duplication-dead-code` — Código duplicado ≤ 3% y 0 exports sin uso — contiene /"jscpd"|"knip"/ en package.json
- [ ] `no-secrets-in-repo` 🔒 — Cero secretos en el repo y en el bundle del cliente — sin /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----)|(?:\b[sr]k_live_[0-9a-zA-Z]{16,})|(?:\bwhsec_[0-9a-zA-Z]{16,})|(?:\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,})|(?:\bAKIA[0-9A-Z]{16}\b)|(?:\bgh[pousr]_[A-Za-z0-9]{36,})|(?:\bxox[abposr]-[A-Za-z0-9-]{10,})|(?:\bAIza[0-9A-Za-z_-]{35}\b)|(?:\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,})|(?:\bnpm_[A-Za-z0-9]{36}\b)|(?:"type":\s*"service_account")|(?:\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://[^\s:/@"']+:[^\s@"'$]{3,}@)|(?:(?:NEXT_PUBLIC|VITE|PUBLIC)_[A-Z_]*SERVICE_ROLE)/ en **/*
- [ ] `public-env-prefix` 🔒 — Al cliente solo llegan variables con prefijo público, y ninguna es secreta — sin /\b(NEXT_PUBLIC|VITE|PUBLIC)_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|_TOKEN\b|WEBHOOK)/ en **/*.{ts,tsx,js,jsx,mjs,astro,vue,svelte,json,example}
- [ ] `readme` — README con arranque, scripts y estructura — existe README.md · contiene /^#+\s*(Instalaci|Install|Setup|Arranque|Getting started)/ en README.md
- [ ] `secrets-scan-ci` — Escaneo de secretos en pre-commit y en CI, incluido el historial — contiene /gitleaks|trufflehog/ en .github/workflows/*.{yml,yaml} · contiene /gitleaks|trufflehog|secretlint/ en {.husky/*,lefthook.{yml,yaml},.pre-commit-config.yaml,.lintstagedrc*,package.json}
- [ ] `strict-lint` — Lint estricto con 0 errores; complejidad ≤ 10, archivos ≤ 300 líneas, funciones ≤ 50 líneas — umbrales de complejidad y largo en la config del linter · `pnpm -s lint` sale con 0
- [ ] `strict-types` — TypeScript strict y 0 any explícitos — tsconfig.json → compilerOptions.strict = true · sin /:\s*any\b|<any>|as any\b/ en {app,src,components,lib,hooks,services,utils}/**/*.{ts,tsx}

#### 🟡 Recomendados
- [ ] `a11y-automated-tests` — Test automatizado de accesibilidad en CI (axe o similar) — contiene /@axe-core|axe-core|pa11y|lighthouse-ci|@lhci/ en {package.json,.github/workflows/*.{yml,yaml}}
- [ ] `dependency-updates-bot` — Dependabot o Renovate — existe .github/dependabot.yml o .github/dependabot.yaml o renovate.json o .github/renovate.json
- [ ] `git-conventional-commits` — Commits con formato consistente (Conventional Commits) — existe commitlint.config.{js,mjs,ts,cjs} o .commitlintrc o .commitlintrc.json o .commitlintrc.yml
- [ ] `git-pr-template` — Plantilla de PR que referencia los ítems del brief afectados — contiene /BRIEF|brief|mep/ en .github/{pull_request_template.md,PULL_REQUEST_TEMPLATE.md,PULL_REQUEST_TEMPLATE/*.md}
- [ ] `git-protected-main` — main protegida: sin push directo, PR con checks obligatorios (build, lint, tests, mep verify) — existe .github/workflows/*.{yml,yaml} · manual: main protegida con los checks obligatorios en GitHub
- [ ] `quality-review` — Revisión de calidad antes de cerrar cada sub-etapa — manual: Revisión de calidad hecha al cerrar la última sub-etapa
- [ ] `static-analysis-ci` — Análisis estático en CI (Semgrep o CodeQL) — contiene /codeql|semgrep/ en .github/workflows/*.{yml,yaml}

### foundation.design

#### 🔴 Obligatorios
- [ ] `a11y-contrast` — Contraste WCAG AA — manual: Cada par de tokens texto/fondo cumple 4.5:1 (3:1 en texto grande) en ambos temas
- [ ] `a11y-focus-visible` — Foco visible — contiene /focus-visible/ en **/*.{css,scss,tsx,jsx,ts} · sin /outline:\s*(none|0)\s*;?(?![^}]*focus-visible)/ en **/*.{css,scss}
- [ ] `a11y-reduced-motion` — Respeta prefers-reduced-motion — contiene /prefers-reduced-motion|motion-reduce|motion-safe|useReducedMotion|MotionConfig/ en **/*.{css,scss,tsx,jsx,ts}
- [ ] `design-system-components` — Tema de shadcn/ui desde los tokens; componentes al primer uso — existe components.json o {src/,}components/ui/*
- [ ] `design-system-page` — Página /design-system con tokens, jerarquía de texto y componentes — ruta /design-system
- [ ] `design-theme-ready` — Tokens preparados para tema claro y oscuro — contiene /\.dark\s*\{|\[data-theme=["']?dark|prefers-color-scheme:\s*dark/ en **/*.{css,scss}
- [ ] `design-tokens` — Tokens en un solo lugar: color, tipografía, espaciado, radios, sombras, z-index, breakpoints y motion — contiene /--(primary|foreground|background)\s*:/ en **/*.{css,scss} · contiene /--(radius|duration|ease|shadow|z-)/ en **/*.{css,scss,ts,js}
- [x] `font-families` — Máximo 2 familias tipográficas — familias tipográficas ≤ 2
- [ ] `no-hardcoded-colors` — Cero colores hardcodeados fuera de los tokens — sin /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(\s*\d/ en {app,src,components,pages}/**/*.{tsx,jsx,astro,vue,svelte} · sin /-\[(#|rgb|hsl)/ en **/*.{tsx,jsx,astro,vue,svelte,html}
- [ ] `no-inline-styles` — Nada de estilos inline para color o espaciado — sin /style=\{\{[^}]*\b(color|background|backgroundColor|margin|padding|gap)\b/ en **/*.{tsx,jsx}
- [ ] `text-hierarchy` — Jerarquía de texto: ≤6 tamaños, ≤3 pesos, ≤3 colores, como tokens — contiene /text-(display|h1|h2|h3|body|small)\b|--text-(display|h1|h2|h3|body|small)/ en **/*.{css,scss,ts,js} · sin /\btext-\[\d|font-\[\d|\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/ en {app,src,components,pages}/**/*.{tsx,jsx,astro} · pesos de texto ≤ 3 · sin /\btext-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\btext-(black|white)\b/ en {app,src,components,pages}/**/*.{tsx,jsx,astro,vue,svelte}
- [ ] `web-fonts` — Fuentes con font-display: swap, subset y self-hosted — contiene /next/font|font-display:\s*swap|@fontsource/ en **/*.{ts,tsx,css,scss,json} · sin /fonts\.googleapis\.com/ en **/*.{tsx,jsx,astro,html,css}

### build.features

#### 🔴 Obligatorios
- [ ] `clean-urls` — URLs limpias: minúsculas, guiones, sin IDs innecesarios; trailing slash consistente — existe {app,src/app,pages,src/pages,src/routes}/**/* · HTML del build: clean_links
- [x] `cookie-attributes` — Cookies propias con Secure, HttpOnly cuando aplique, SameSite y expiración mínima — sin /(cookies\(\)\.set|setCookie|document\.cookie\s*=)(?![^\n]*(secure|Secure|sameSite|SameSite))/ en **/*.{ts,tsx,js}
- [ ] `copy-in-translation-files` — Textos fuera del código, en archivos de traducción (aunque haya un solo idioma) — existe {messages,locales,src/messages,src/locales,i18n,src/i18n}/**/*.json
- [ ] `internal-no-public-signup` — Sin registro público: solo cuentas del dominio de la empresa o invitadas — contiene /allowed.?domains?|domain.?allow.?list|enable_?signup\s*[:=]\s*false|disableSignUp|hostedDomain/ en **/*.{ts,tsx,js,toml,json}
- [ ] `internal-sso` — Inicio de sesión con el proveedor de identidad de la empresa (Google Workspace, Microsoft Entra, Okta) — contiene /azure-ad|microsoft-entra-id|okta|workos|saml|oidc|hostedDomain|hd:\s*["']/ en **/*.{ts,tsx,js}
- [ ] `logs-without-secrets` — Logs sin contraseñas, tokens ni datos personales — sin /console\.(log|info|debug|warn|error)\([^)]*\b(password|passwd|token|secret|apiKey|api_key|authorization)\b/ en **/*.{ts,tsx,js,jsx}
- [ ] `no-raw-html` — XSS: nada de HTML crudo sin sanitizar — sin /^(?!.*(DOMPurify|sanitize|JSON\.stringify)).*(dangerouslySetInnerHTML|v-html=|\.innerHTML\s*=|set:html=)/ en **/*.{tsx,jsx,ts,js,vue,svelte,astro}
- [ ] `owasp-top10-review` — Checklist OWASP Top 10 revisado — manual: OWASP Top 10 revisado punto por punto
- [ ] `public-page-urls` — Cada página pública tiene URL propia — sin /createHashRouter|<HashRouter|useHashLocation/ en **/*.{tsx,jsx,ts,js} · manual: Cada sección pública abre directo desde su URL
- [ ] `safe-redirects` — Redirecciones abiertas: parámetros de redirect contra lista permitida — sin /redirect\(\s*(searchParams|req\.query|params|query)\b|location\.href\s*=\s*(searchParams|params|query)/ en **/*.{ts,tsx,js,jsx} · manual: Todo parámetro de redirect se valida contra la lista permitida
- [ ] `server-only-keys` 🔒 — Llaves privilegiadas solo en código de servidor — sin /SERVICE_ROLE|STRIPE_SECRET|SECRET_KEY|PRIVATE_KEY/ en {components,src/components,app/**/_components,src/hooks,hooks}/**/*.{ts,tsx,js,jsx} · manual: Ningún archivo "use client" importa módulos con llaves privilegiadas
- [ ] `ssrf-allowlist` — SSRF: si el servidor descarga URLs del usuario, lista permitida de dominios — manual: Ningún fetch del servidor usa una URL del usuario sin lista permitida
- [ ] `unit-tests` — Lógica de negocio con tests unitarios — existe **/*.{test,spec}.{ts,tsx,js} · `pnpm -s test` sale con 0
- [ ] `upload-size-limits` — Tamaño máximo por archivo y por usuario aplicado en el servidor — contiene /max_?file_?size|maxFileSize|fileSizeLimit|file_size_limit|maxSize|content-length-range|MAX_UPLOAD/ en **/*.{ts,js,sql,toml}
- [ ] `upload-validation` — Uploads: tipo real, tamaño, nombres aleatorios y storage separado — contiene /file-type|fileTypeFromBuffer|magic|allowedMimeTypes|maxFileSize|fileSizeLimit/ en **/*.{ts,tsx,js,jsx} · contiene /randomUUID|nanoid|uuidv4|createId\(/ en **/*.{ts,tsx,js,jsx}

#### 🟡 Recomendados
- [ ] `test-coverage` — Cobertura mínima en lógica de negocio (ej. 70%) — contiene /thresholds|coverageThreshold/ en {vitest.config.{ts,mts,js},jest.config.{ts,js},package.json}
- [ ] `upload-antivirus` — Escaneo antivirus de uploads — manual: Uploads escaneados antes de estar disponibles
- [ ] `upload-strip-metadata` — Las fotos subidas se procesan: tamaño redimensionado y metadatos EXIF (ubicación) eliminados — contiene /exif|sharp\(|\.rotate\(\)|withMetadata|strip.?metadata|cloudinary/ en **/*.{ts,js}

### build.ux

#### 🔴 Obligatorios
- [ ] `a11y-keyboard` — Navegación completa por teclado — sin /<(div|span)\b[^>]*onClick=(?![^>]*(role=|tabIndex))/ en **/*.{tsx,jsx} · manual: Todos los flujos principales se completan solo con teclado
- [ ] `a11y-landmarks` — Landmarks: header, nav, main, footer — HTML del build: landmarks
- [ ] `a11y-skip-link` — Skip link al contenido principal — HTML del build: skip_link
- [ ] `a11y-zoom` — Zoom al 200% sin romper el layout — sin /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?["',]/ en **/*.{tsx,jsx,ts,js,astro,html} · manual: Las páginas clave funcionan al 200% de zoom sin perder contenido
- [ ] `autosave-drafts` — Autoguardado o borrador local en formularios largos — contiene /autosave|autoSave|draft|localStorage\.setItem/ en **/*.{tsx,jsx,ts}
- [x] `crawlable-links` — Enlaces internos con <a href> rastreable — sin /<(div|span|li|td|tr)\b[^>]*onClick=\{[^}]*(router\.push|navigate\(|location\.href)/ en **/*.{tsx,jsx}
- [ ] `custom-components` — Componentes propios al primer uso: empty state, skeletons por patrón, page header, indicador de conexión, barra de progreso — contiene /EmptyState|empty-state/ en **/*.{tsx,jsx,astro,vue,svelte} · contiene /Skeleton/ en **/*.{tsx,jsx,astro,vue,svelte}
- [x] `destructive-accessible` — Long press con alternativa por teclado; el botón destructivo nunca tiene el foco por defecto — sin /variant=["']destructive["'][^>]*autoFocus/ en **/*.{tsx,jsx}
- [x] `destructive-severity` — Acciones destructivas por severidad: deshacer, long press o diálogo, diálogo explícito, confirmación escrita — contiene /Deshacer|Undo|undo\(/ en **/*.{tsx,jsx,ts,json} · contiene /AlertDialog|confirm/ en **/*.{tsx,jsx}
- [ ] `error-pages` — Páginas 404 y 500 — ruta /404 · ruta /500
- [ ] `heading-hierarchy` — Un solo <h1> por página y uso correcto de h2, h3 y body — HTML del build: single_h1 · HTML del build: heading_order · manual: h2, h3 y body usan los estilos de texto del sistema de diseño según su rol, no por apariencia
- [ ] `interactive-states` — Estados hover, focus, active y disabled en todo elemento interactivo — contiene /hover:/ en **/*.{tsx,jsx,astro,vue,svelte,css} · contiene /disabled:/ en **/*.{tsx,jsx,astro,vue,svelte,css} · sin /<(button|a)\b(?=[^>]*className=)(?![^>]*className=["'{`][^>]*hover:)[^>]*>/ en **/*.{tsx,jsx,astro,vue,svelte}
- [ ] `line-length` — Largo de línea 60–80 caracteres, también en ultra wide — contiene /max-w-prose|max-width:\s*\d+ch|prose/ en **/*.{tsx,jsx,astro,css,mdx}
- [ ] `live-dropzone` — Dropzone viva: reposo, arrastrando encima, subiendo, éxito o error por archivo — contiene /Dropzone|useDropzone|onDragOver|isDragActive/ en **/*.{tsx,jsx}
- [ ] `mobile-first` — Mobile-first: móvil 360–767, tablet 768–1023, desktop 1024–1919, ultra wide ≥ 1920 con ancho máximo centrado — contiene /max-w-|max-width/ en **/*.{tsx,jsx,astro,css}
- [ ] `motion-transitions` — Transiciones en aperturas, cierres, cambios de estado y entrada de listas (150–300 ms desde tokens) — contiene /--duration|transitionDuration|duration-(fast|normal|slow|\d+)/ en **/*.{css,scss,ts,js,tsx}
- [ ] `nav-active-page` — Página activa indicada en el menú — contiene /aria-current/ en **/*.{tsx,jsx,astro,vue,svelte}
- [ ] `nav-history` — El botón atrás funciona; tabs, filtros y modales relevantes en la URL; scroll restaurado — manual: Atrás y adelante devuelven al estado anterior, con su scroll, en las vistas clave
- [ ] `nav-logo-footer` — Logo enlaza al inicio; footer con legales y contacto — contiene /href=["']/["']/ en **/*.{tsx,jsx,astro,vue,svelte,html} · contiene /<footer/ en **/*.{tsx,jsx,astro,vue,svelte,html}
- [x] `nav-mobile-menu` — Menú móvil accesible: cierra con Esc y mantiene el foco dentro — contiene /Sheet|Dialog|Drawer|NavigationMenu/ en **/*.{tsx,jsx}
- [ ] `no-console-errors` — Cero errores en la consola del navegador — contiene /pageerror|console\.error|msg\.type\(\)\s*===\s*["']error/ en {tests,e2e}/**/*.{ts,js} · `pnpm run test:responsive` sale con 0
- [ ] `no-hover-only` — Nada depende solo de hover; orientación horizontal sin romper — sin /onMouseEnter=(?![\s\S]{0,200}(onFocus|onClick))/ en **/*.{tsx,jsx} · manual: Móvil y tablet funcionan en orientación horizontal
- [ ] `page-progress-bar` — Barra de progreso en navegación entre páginas — contiene /nextjs-toploader|@bprogress|nprogress|TopLoader|useLinkStatus|ProgressBar/ en **/*.{tsx,jsx,ts,json}
- [ ] `real-progress` — Progreso real (%) en operaciones largas — contiene /onUploadProgress|progress|Progress/ en **/*.{tsx,jsx,ts}
- [ ] `responsive-screenshots` — Capturas automáticas en 360, 768, 1280, 1920 y 2560 px sin scroll horizontal ni elementos encimados — package.json → scripts.test:responsive · existe tests/responsive.spec.{ts,js} o e2e/responsive.spec.{ts,js} · `pnpm run test:responsive` sale con 0
- [x] `safe-areas-dvh` — Áreas seguras (notch) y alturas con dvh, no vh — sin /\b(min-)?h-screen\b|100vh/ en **/*.{tsx,jsx,astro,vue,svelte,css,scss}
- [ ] `skeletons` — Skeletons con la forma del contenido real — contiene /Skeleton/ en **/*.{tsx,jsx,astro,vue,svelte}
- [x] `spacing-scale` — Solo valores de la escala de espaciado — sin /\b-?(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|inset|top|left|right|bottom)-\[\d/ en **/*.{tsx,jsx,astro,vue,svelte,html}
- [ ] `ui-principles` — Principios de UI aplicados (jerarquía, retícula, escala, largo de línea, espacio en blanco, 60-30-10, Gestalt, affordances, consistencia, Nielsen) — manual: Vistas clave revisadas contra los principios de UI y las heurísticas de Nielsen
- [ ] `unsaved-changes-warning` — Aviso al salir con cambios sin guardar — contiene /beforeunload|useBeforeUnload|onbeforeunload/ en **/*.{tsx,jsx,ts}
- [ ] `ux-laws` — Leyes de UX aplicadas (Doherty, Fitts, Hick, Miller, Jakob, Gestalt, Von Restorff, Tesler, Goal-gradient, Peak-end) — manual: Vistas clave revisadas contra las leyes de UX (objetivos ≥ 44 px, un CTA principal, progreso visible, finales de flujo cuidados)

### launch.content

#### 🔴 Obligatorios
- [ ] `a11y-alt-text` — Alt text en imágenes (vacío en decorativas) — HTML del build: img_alt · sin /<(img|Image)\b(?![^>]*\balt=)[^>]*>/ en **/*.{tsx,jsx,astro,html}
- [ ] `asset-licenses` — Licencias válidas de fuentes, imágenes e íconos — existe docs/**/{licencias,licenses,credits,creditos}*.md o CREDITS.md
- [ ] `cookie-inventory` — Inventario de lo que se guarda en el navegador, con categoría — existe docs/cookies.md o docs/**/cookies*.md o {src/,}{lib,config}/cookies.{ts,json}
- [ ] `cookie-policy` — Política de cookies basada en el inventario — existe {app,src/app}/**/cookies/page.{tsx,mdx,jsx} o src/pages/cookies.{astro,md,mdx} o content/**/cookies.{md,mdx}
- [ ] `final-copy` — Textos finales en todas las páginas, incluidas 404 y 500 (útiles, con salida) — manual: Todas las páginas tienen texto final aprobado, incluidas 404 y 500
- [ ] `intellectual-property` — Propiedad intelectual: aviso de derechos, marcas y cesión al cliente — contiene /©|&copy;|\(c\)\s*\d{4}|Copyright/ en **/*.{tsx,jsx,astro,html,vue,svelte} · manual: En proyecto para cliente: cesión de propiedad intelectual firmada
- [x] `microcopy` — Microcopy: botones con verbo claro y errores que dicen qué pasó y cómo arreglarlo — sin />\s*(OK|Ok|Submit|Enviar|Aceptar|Error|Click here|Haz clic aquí)\s*</ en **/*.{tsx,jsx,astro,vue,svelte,html}
- [x] `no-placeholder-content` — Cero lorem ipsum, placeholders o TODO visibles — sin /lorem ipsum|dolor sit amet|>\s*(TODO|TBD|Texto aquí|Your text here)\b/ en **/*.{tsx,jsx,astro,vue,svelte,html,md,mdx,json}
- [ ] `visible-contact` — Contacto o responsable visible — contiene /mailto:|/contact|/contacto/ en **/*.{tsx,jsx,astro,html}

#### 🟡 Recomendados
- [ ] `accessibility-statement` — Declaración de accesibilidad — existe {app,src/app}/**/{accesibilidad,accessibility,barrierefreiheit,accessibilite}/page.{tsx,mdx,jsx} o src/pages/{accesibilidad,accessibility}.{astro,md,mdx}
- [ ] `voice-and-tone` — Guía de voz y tono — existe docs/**/{voz,voice,tono,tone}*.md

### launch.seo

#### 🔴 Obligatorios
- [ ] `bundle-budget` — Sin bundle JS gigante: ningún archivo sobre 200 KB gzip — JS por archivo ≤ 200 KB gzip
- [ ] `canonical-link` — <link rel="canonical"> en cada página — HTML del build: link canonical
- [ ] `favicon` — Favicon (ico/svg) + apple-touch-icon — existe app/favicon.ico o src/app/favicon.ico o app/icon.svg o src/app/icon.svg o app/icon.png o src/app/icon.png o public/favicon.ico o public/favicon.svg · existe app/apple-icon.png o src/app/apple-icon.png o public/apple-touch-icon.png
- [ ] `html-lang` — Atributo lang en <html> — HTML del build: html_lang
- [ ] `image-loading-priority` — Lazy loading bajo el pliegue; la imagen principal (LCP) eager + fetchpriority=high — contiene /\bpriority\b|fetchPriority=|fetchpriority=/ en **/*.{tsx,jsx,astro,html}
- [ ] `media-dimensions` — width y height en todas las imágenes y videos — HTML del build: img_dimensions
- [ ] `meta-charset` — <meta charset="utf-8"> — HTML del build: charset
- [ ] `meta-viewport` — <meta name="viewport"> — HTML del build: meta viewport · sin /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?["',]/ en **/*.{tsx,jsx,ts,js,astro,html}
- [x] `modern-image-formats` — Imágenes raster en WebP o AVIF con srcset responsive (SVG en logos e íconos; og:image en JPG/PNG) — sin /<img\b[^>]*src=["'][^"']*\.(jpe?g|png)["']/ en **/*.{tsx,jsx,astro,html}
- [ ] `og-image-default` — Imagen de preview al compartir (og:image) por defecto + por página clave — existe app/opengraph-image.{png,jpg,jpeg,tsx,ts,js} o src/app/opengraph-image.{png,jpg,jpeg,tsx,ts,js} o public/og*.{png,jpg,jpeg} o public/**/og*.{png,jpg,jpeg} · HTML del build: absolute_og_image
- [ ] `og-image-specs` — og:image 1200×630 JPG/PNG < 300 KB, con width, height, alt y twitter:card — HTML del build: meta og:image:width · HTML del build: meta og:image:height · HTML del build: meta og:image:alt · HTML del build: meta twitter:card · manual: La imagen pesa < 300 KB y el texto importante está en el área central
- [ ] `open-graph-basic` — Open Graph mínimo (og:title, og:description, og:image, og:url, og:type) — HTML del build: meta og:title · HTML del build: meta og:description · HTML del build: meta og:image · HTML del build: meta og:url · HTML del build: meta og:type
- [ ] `redirects-on-change` — 301 cuando una URL cambia — manual: Ninguna URL publicada antes responde 404; las que cambiaron tienen 301
- [x] `robots-allows-assets` — robots.txt no bloquea CSS ni JS — sin /[Dd]isallow:\s*/(_next|static|assets|css|js|_astro)\b|[Dd]isallow:.*\.(css|js)\b|disallow:\s*\[?["']/(_next|static|assets|_astro)/ en {public/robots.txt,static/robots.txt,app/robots.{ts,js},src/app/robots.{ts,js}}
- [ ] `robots-txt` — robots.txt — ruta /robots.txt
- [ ] `sitemap-indexable-only` — sitemap.xml incluye solo páginas indexables — el sitemap lista solo páginas públicas e indexables
- [ ] `sitemap-xml` — sitemap.xml — ruta /sitemap.xml
- [ ] `unique-description` — <meta name="description"> única por página — HTML del build: unique_description
- [ ] `unique-title` — <title> único por página — HTML del build: unique_title

#### 🟡 Recomendados
- [ ] `core-web-vitals-budget` — Presupuesto Core Web Vitals: LCP < 2.5 s · INP < 200 ms · CLS < 0.1 — contiene /@lhci|lighthouse|@vercel/speed-insights/ en {package.json,.github/workflows/*.{yml,yaml},lighthouserc*}
- [ ] `theme-color` — <meta name="theme-color"> — HTML del build: meta theme-color
- [ ] `web-manifest` — Web manifest — existe app/manifest.ts o src/app/manifest.ts o app/manifest.json o public/manifest.webmanifest o public/manifest.json o public/site.webmanifest

### launch.ops

#### 🔴 Obligatorios
- [ ] `canonical-redirects` — Redirección canónica http→https y www↔sin-www — http:// y www redirigen al dominio canónico
- [ ] `compression-caching` — Compresión (Brotli/gzip) y caché larga en assets con hash — el sitio sirve con Brotli/gzip y assets con caché inmutable
- [ ] `cost-control` — Alertas de presupuesto y límites duros de gasto en hosting, DB, APIs pagadas y email — manual: Alertas y límites de gasto configurados en cada servicio pagado
- [ ] `error-alerts-routed` — Las alertas de errores llegan a una persona: canal, responsable y umbral definidos — manual: Las alertas de errores nuevos llegan a un canal con responsable, y se probó con un error de prueba
- [ ] `error-monitoring` — Monitoreo de errores en producción — contiene /@sentry/|@highlight-run|@bugsnag|posthog.*captureException|@vercel/otel|@logtail/ en {package.json,**/*.{ts,tsx}}
- [ ] `https-hsts` 🔒 — HTTPS + HSTS — contiene /Strict-Transport-Security/ en {next.config.{js,mjs,ts},vercel.json,middleware.{ts,js},src/middleware.{ts,js},netlify.toml,public/_headers,astro.config.{mjs,ts}} · el sitio envía HSTS ≥ 180 días
- [ ] `key-rotation-procedure` — Procedimiento de rotación de llaves documentado — contiene /rotaci[oó]n|rotat(e|ion)/ en {SECURITY.md,README.md,docs/**/*.md}
- [ ] `keys-per-environment` — Llaves distintas por entorno (desarrollo, preview, producción) — manual: Cada entorno usa sus propias llaves, guardadas en el gestor del hosting
- [ ] `no-public-source-maps` — Sin source maps públicos en producción — sin /productionBrowserSourceMaps:\s*true|sourcemap:\s*(true|["']inline["'])/ en {next.config.{js,mjs,ts},vite.config.{js,mjs,ts},astro.config.{mjs,ts}} · sin source maps públicos
- [ ] `noindex-preview` — noindex en preview/staging, nunca en producción — contiene /VERCEL_ENV|NODE_ENV|X-Robots-Tag|process\.env\.[A-Z_]*ENV/ en {app,src/app,src/pages,pages}/**/robots.{ts,js}
- [ ] `open-source-licenses` — Licencias open source de las dependencias revisadas y con atribución — contiene /license-checker|licensee|license-report|licenses-list|pnpm licenses|@onebeyond/license-checker/ en {package.json,.github/workflows/*.{yml,yaml}} · existe THIRD-PARTY-NOTICES* o THIRD_PARTY_NOTICES* o docs/**/{licencias,licenses,third-party}*.md o CREDITS.md
- [ ] `production-errors-hidden` — Errores en producción sin stack traces ni detalles internos — sin /(error|err)\.stack|JSON\.stringify\((error|err)\)/ en {app,src/app,pages,src/pages}/**/{route,api,*.api}.{ts,js} · una ruta inexistente da 404 sin detalles internos
- [ ] `security-headers` — Headers: X-Content-Type-Options, Referrer-Policy, frame-ancestors — contiene /X-Content-Type-Options/ en {next.config.{js,mjs,ts},vercel.json,middleware.{ts,js},src/middleware.{ts,js},netlify.toml,public/_headers,astro.config.{mjs,ts}} · contiene /Referrer-Policy/ en {next.config.{js,mjs,ts},vercel.json,middleware.{ts,js},src/middleware.{ts,js},netlify.toml,public/_headers,astro.config.{mjs,ts}} · contiene /frame-ancestors|X-Frame-Options/ en {next.config.{js,mjs,ts},vercel.json,middleware.{ts,js},src/middleware.{ts,js},netlify.toml,public/_headers,astro.config.{mjs,ts}} · el sitio envía x-content-type-options, referrer-policy, x-frame-options|frame-ancestors
- [ ] `separate-environments` — Entornos separados (producción / preview) con variables distintas — manual: Preview y producción usan bases de datos y llaves distintas
- [x] `uptime-monitor` — Monitor de disponibilidad con alerta a un canal que alguien mira — contiene /uptime|better.?stack|betteruptime|uptimerobot|checkly|openstatus|pingdom|statuscake/ en {README.md,docs/**/*.md,**/*.{json,yml,yaml,ts}}

#### 🟡 Recomendados
- [ ] `analytics-event-plan` — Plan de eventos definido antes de lanzar (registro, activación, compra, cancelación) — existe docs/**/{analytics,eventos,events,tracking}*.md
- [ ] `cost-review` — Revisión mensual de costos — manual: Revisión mensual de costos agendada
- [ ] `csp-strict` — Content-Security-Policy estricta — contiene /Content-Security-Policy/ en {next.config.{js,mjs,ts},vercel.json,middleware.{ts,js},src/middleware.{ts,js},netlify.toml,public/_headers} · el sitio envía content-security-policy
- [ ] `e2e-tests` — Tests end-to-end en flujos críticos (login, checkout) — contiene /@playwright/test|cypress/ en package.json
- [ ] `git-tags-codeowners` — Tags de versión y CODEOWNERS — existe .github/CODEOWNERS o CODEOWNERS
- [ ] `internal-offboarding` — Bajas: el acceso se revoca el mismo día que alguien deja la empresa — manual: Procedimiento de baja probado: al desactivar a alguien en el proveedor de identidad pierde el acceso
- [ ] `ops-runbook` — Uptime monitoring, rollback documentado y navegadores soportados — contiene /rollback|Rollback|revertir/ en {README.md,docs/**/*.md}
- [ ] `pentest-before-launch` — Pentest antes de lanzar — manual: Pentest realizado y hallazgos críticos resueltos
- [ ] `search-console` — Search Console verificado y sitemap enviado — manual: Dominio verificado en Search Console y sitemap enviado
- [ ] `security-txt` — security.txt — ruta /.well-known/security.txt
- [ ] `waf-ddos` — Firewall/WAF del hosting y protección DDoS — manual: WAF del hosting configurado

### ⏭️ Omitidos (🟡, con razón)
—

### ⚠️ Desactivados (🔴 con override, con razón)
—

## Costos recurrentes estimados
_Se completan con /mep:quote (hosting, dominio, servicios)._

## Notas legales
> Checklist orientativo, no sustituye asesoría legal.
