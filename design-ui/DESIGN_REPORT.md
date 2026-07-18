# Design Setting Report

**State:** DESIGN_FAILED
**Activation:** User-facing UI without customer design spec — Design Setting ON (world-class default)
**Scope source:** design-scope.json
**Product name:** AccessLink
**Domain keywords:** accessible travel, wheelchair accessible, hotels, Airbnb, accessibility, verified listings, community data

**Title detected:** AccessLink - Accessible Travel Made Easy
**H1 detected:** Cost tracking dashboard

- HTML entries: 2
- CSS files: 15
- UI sources: 33
- MUST violations: 15
- SHOULD violations: 0

## MUST violations (build blockers)

- **D-R013** app/index.html:undefined — Missing data-forge-shell on <html>
- **D-R016** app/index.html:undefined — data-forge-font="plus-jakarta" does not match fontPairId "dm-sans-jetbrains"
- **D-R017** app/index.html:undefined — Missing forge-identity.css link
- **D-R013** app/index.html:undefined — Missing forge-layout-shells.css link
- **D-R015** app/index.html:undefined — Missing signature element class "forge-signature--ticker-strip"
- **D-E012** app/index.html:undefined — Layout shell declared on <html>: matched 0, need ≥1
- **D-E010** app/index.html:undefined — Font pair CSS linked: missing link to forge-font-pairs.css
- **D-E010** app/index.html:undefined — Layout shell CSS linked: missing link to forge-layout-shells.css
- **D-E010** app/index.html:undefined — Per-outcome forge-identity.css linked: missing link to forge-identity.css
- **D-E010** app/index.html:undefined — Enriched product CSS linked: missing link to forge-enriched-product.css
- **D-E012** app/index.html:undefined — Domain signature element in DOM: matched 0, need ≥1
- **D-E012** app/index.html:undefined — KPI row or product hero: matched 0, need ≥1
- **D-E011** app/styles.css:undefined — App styles.css depth (≥80 lines): found 0 non-empty lines, need ≥80
- **D-E014** app/index.html:undefined — data-forge-font="plus-jakarta" must be "dm-sans-jetbrains" per enriched design contract
- **D-E015** app/index.html:undefined — Missing signature class forge-signature--ticker-strip from enriched design contract


## Remediation

1. Add `design-scope.json` with productName + domainKeywords from the customer request.
2. Link `../_shared/forge-design-tokens.css` and `../_shared/forge-design-system.css` in HTML.
3. Replace template/wrong-vertical copy; remove implementation strings from subtitles.
4. Re-run `node tools/forge-design-verify.mjs --outcome <path>`.

