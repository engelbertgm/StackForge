# Security Policy

## Supported versions

Only the latest release on `main` is supported. Fixes are not backported.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report it privately through
[GitHub private vulnerability reporting](https://github.com/engelbertgm/StackForge/security/advisories/new).
Include what you found, steps to reproduce, and the version or commit you tested.

You should get a reply within 7 days. If the report is confirmed, the fix ships in a new
release and you are credited in the advisory, unless you prefer otherwise.

## Scope

StackForge has no backend and no accounts. Everything runs in the browser. The parts
worth looking at:

- **Saved passwords** (`src/crypto.ts`): AES-GCM with a PBKDF2-derived key. Anything that
  weakens the encryption, leaks the passphrase or writes a password to `localStorage`
  in plain text.
- **Import**: a crafted stack JSON file that runs script or reads saved credentials
  when someone imports it.

Out of scope: attacks that need access to an unlocked browser session on the victim's
machine, and vulnerabilities in dependencies that are not exploitable through StackForge
(report those upstream).
