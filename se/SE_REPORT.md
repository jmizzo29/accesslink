# SE Setting Verification Report

Generated: 2026-07-14T18:57:29.245Z
Scope: se-scope.json
Files scanned: 25
Production lines: 1766

## Verdict: FAIL

- MUST violations: **7** (build blocker)
- SHOULD violations: 2 (warnings)

## MUST violations (delivery blocked)

- `app/src/App.tsx:32` **SE-R005** — Nesting depth 6 exceeds limit 5
- `app/src/App.tsx:36` **SE-R005** — Nesting depth 6 exceeds limit 5
- `app/src/pages/CostsPage.tsx:148` **SE-R005** — Nesting depth 7 exceeds limit 5
- `app/src/pages/SearchPage.tsx:86` **SE-R005** — Nesting depth 7 exceeds limit 5
- `components/PropertyCard.tsx:34` **SE-R005** — Nesting depth 6 exceeds limit 5
- `components/SearchSection.tsx:156` **SE-R005** — Nesting depth 7 exceeds limit 5
- `lib/monad.ts:7` **SE-R006** — Function "getRecordCount" spans 130 lines (limit 80)

## SHOULD violations (warnings)

- `components/PropertyCard.tsx:5` **SE-R011** — Explicit any in TypeScript — prefer typed interfaces.
- `lib/monad.ts:84` **SE-R011** — Explicit any in TypeScript — prefer typed interfaces.

## Doctrine

Legendary-engineering principles encoded in `config/settings/se.json`.

