# Product Brief — GHAC Community Den

Purpose: provide a concise, visual-driven reference for UI and data decisions.

## Objectives
- Build authentic donor relationships (shift from anonymous to intentional).
- Understand motivations, barriers, and what deepens engagement.
- Identify high‑value actions: volunteering, ambassadorship, board readiness, legacy giving.
- Reactivate lapsed/workplace donors; expand into “creative minds” network.
- Validate messaging themes to refine GHAC positioning and appeals.

## Audiences / Segments
- Active donors (2–3k): deepen ties and surface major gift potential.
- Lapsed donors (≤5y): diagnose drop‑off; invite re‑entry.
- Workplace alumni: rekindle interest post‑campaign era.
- Creative minds: arts‑curious professionals; future pipeline.

## Success Metrics (initial)
- Response rate, completion rate, opt‑in rate.
- Segment coverage across towns/ZCTAs.
- Intent signals (volunteer, board, give more) and archetype clarity.
- Reactivation pipeline size and conversion to actions.

## Visual Drivers
- Core KPIs: respondents, completion, opt‑in, sentiment.
- Engagement funnels and spectra.
- Archetype distribution and per‑ZIP breakdowns.
- Geographic reach (map first, lists optional as secondary views).

## Data Inputs (MVP)
- Participants by ZIP: { zip, city, count, archetypes: { name: count } }.
- Archetypes catalog: name, color, description (single source of truth at `src/data/archetypes.json`).
- Optional polygons: ZCTA GeoJSON for choropleth.

## Planned Visual Modules
- Interactive ZIP map (dots scaled by count; color by dominant archetype; tooltip with breakdown).
- Archetype spectrum donut (overall distribution).
- Driver/risk funnels (ChartFunnel).
- Export actions (CSV slices) for downstream workflows.

## Principles
- Clean, calm UI; minimal chrome; brand‑aligned greens and neutrals.
- Start descriptive; add predictive/diagnostic layers as data matures.
- Prefer single sources of truth for colors and labels.

---
Owner: Nesolagus  •  Last updated: auto as features evolve
