# Contributing to StackForge

Thanks for helping. Most contributions are catalog changes: a missing technology, a wrong
conflict, or an arrow that points the wrong way. Those are one JSON edit and need no code.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Found a bug?** Open a [bug report](https://github.com/e-mdj7/StackForge/issues/new?template=bug_report.yml).
- **Missing or wrong technology?** Open a [catalog request](https://github.com/e-mdj7/StackForge/issues/new?template=catalog_request.yml), or skip the issue and send the pull request.
- **Bigger change** (new rule, new box, UI or routing behavior)? Open an issue first so we can agree on the approach before you write it.

## Setup

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/e-mdj7/StackForge.git
cd StackForge
pnpm install
pnpm dev            # http://localhost:5173
```

There are no environment variables and no services to run.

## Adding or fixing a technology

1. Open `src/catalog/<group>.json` and copy a neighbour in the same section.
2. Change the fields. `src/types.ts` documents each one, and the
   [catalog section of the README](README.md#the-catalog) explains what `conflicts`,
   `exclusive`, `needs`, `links` and `provides` produce on the canvas.
3. Write `desc` like the entries around it: one sentence on what it is, then "Use when..." or "Use to...".
4. Set `icon` to the [simpleicons.org](https://simpleicons.org) slug if one exists. Leave it out otherwise and the block shows initials.
5. Move the entry from **Planned** to **In** in `entries.md` and update the totals there and in the README.
6. Run `pnpm check`. It fails on a misspelled section, a link to an id that does not exist, or a `need` nothing provides.

Adding a whole box: add it to `groups.json` with its `sections`, create `<id>.json`, then add two lines to `src/catalog/index.ts`.

## Code changes

- Keep the test next to the module it covers (`rules.test.ts`, `routing.test.ts`, `snap.test.ts`). Tests use `node --test` and `assert`, no framework.
- Keep the diff focused on one change. Discuss new dependencies in an issue first.

## Before opening a pull request

Run what CI runs:

```bash
pnpm check    # rule engine, catalog integrity, wire router, snapping
pnpm lint     # oxlint
pnpm build    # type-check and production build
```

Then:

- Use a [Conventional Commits](https://www.conventionalcommits.org) prefix: `feat:`, `fix:`, `docs:`, `chore:`.
- Describe what changed and why. For visual changes, add a screenshot.
- Link the issue it closes, if there is one.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
