# Forge Wisdom Verification Report

Generated: 2026-07-14T18:57:36.645Z
Scope: default (delivery outcome)
Legacy exempt: false
Files scanned: 29

## Verdict: FAIL

- **V-WISDOM-OUTCOME-PATH** — PASS — Outcome lives under delivery-package/<slug>/
- **V-WISDOM-README** — PASS — README.md documents the delivery outcome
- **V-WISDOM-NO-EVAL** — PASS — No eval() or new Function() in production source
- **V-WISDOM-NO-HARDCODED-SECRET** — PASS — No hardcoded API keys or signing secrets in production source
- **V-WISDOM-NO-EMPTY-CATCH** — PASS — No empty catch blocks that swallow errors
- **V-WISDOM-NO-FORBIDDEN-MARKETING** — PASS — Consumer UI must not use forbidden marketing without Proof Layer assignment
- **V-WISDOM-NO-HAND-CERTIFY** — PASS — Hand-written docs must not claim CERTIFIED/PRODUCTION_VALIDATED without Proof Layer
- **V-WISDOM-VERIFY-EXISTS** — PASS — verify.mjs present for verifiable outcomes
- **V-WISDOM-VERIFY-BEHAVIORAL** — FAIL — verify.mjs appears existence-only
- **V-WISDOM-FRONTIER-PACKAGE** — FAIL — Frontier design package authored before delivery
- **V-WISDOM-CEILING-CONTRACT** — FAIL — Ceiling contract exists (frontier-first plan)

Doctrine: `config/settings/wisdom.json` + `forge-wisdom-donts.mdc`.
