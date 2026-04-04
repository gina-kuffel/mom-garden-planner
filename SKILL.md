# Mom's Garden Planner — Project Log
*Running record of decisions, architecture, and work completed*

---

## Project Overview

An interactive garden bed planning tool for a brick split-level home in Arlington Heights, IL (Zone 6a/6b). The goal is to visualize plant placement over actual photos of the house before committing to a design.

**Live app**: https://mom-garden-planner.vercel.app/  
**Primary repo**: https://github.com/kuffelgr/mom-garden-planner  
**Vercel-connected repo (fork)**: https://github.com/gina-kuffel/mom-garden-planner

---

## Architecture Decisions

### Why React + Vite instead of plain HTML/canvas

We started with a plain HTML canvas approach and spent significant time trying to:
- Draw a realistic house background programmatically (failed — always looked cartoonish)
- Calibrate bed regions as coordinate fractions over a photo overlay (failed — never landed correctly across different photo crops and angles)
- Render plant photos via canvas drawImage (failed — CORS blocked Wikimedia images in canvas context)

**The fundamental problem with canvas**: bed position is a guessing game. Every photo has different proportions and framing, so hard-coded y-coordinate fractions never land on the actual mulch strip.

**The React solution**: plants are absolutely-positioned `<div>` elements over a regular `<img>` tag. You click exactly where you want a plant — no coordinate calibration needed. Plant photos are standard `<img>` elements — no CORS issues. State is React state — undo, reorder, resize are straightforward to add.

### Why Vite instead of Create React App

CRA is officially deprecated. Vite is the current standard, builds faster, and Vercel handles it identically.

### Photo Storage: Vercel Blob

Reference photos are stored in Vercel Blob (not committed to the git repo). Blob store is attached to the `mom-garden-planner` Vercel project under the `gina-kuffel` account.

| File | Vercel Blob URL |
|---|---|
| `bedA.jpeg` | `https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedA.jpeg` |
| `bedB.jpeg` | `https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/bedB.jpeg` |
| `whole-home.jpeg` | `https://sg4c4d4k3ddwfv8d.public.blob.vercel-storage.com/whole-home.jpeg` |

To add or replace photos: `vercel blob put <filename>` from the repo root (must be linked to the `gina-kuffel` Vercel project via `vercel link`).

### Deployment: Vercel via gina-kuffel

Vercel is connected to the `gina-kuffel` fork. Auto-deploy fires on every commit to `main` on `gina-kuffel/mom-garden-planner`. Claude's GitHub connector writes to `kuffelgr/mom-garden-planner` — the push to `gina-kuffel` is handled by Claude directly via the GitHub API as a second commit to keep both repos in sync.

---

## GitHub / Vercel Account Split

| Item | Detail |
|---|---|
| Account 1 | `gina-kuffel` — personal primary account, authenticated in Mac Keychain |
| Account 2 | `kuffelgr` — second account |
| Claude GitHub connector | Authenticated as `kuffelgr` — all tool-based commits go here |
| Vercel project | Under `gina-kuffel` — auto-deploy fires on commits to that fork |
| Deploy workflow | Claude commits to `kuffelgr` repo, then separately commits same content to `gina-kuffel` fork to trigger Vercel |
| Vercel Blob | Attached to `gina-kuffel` Vercel project; upload via `vercel blob put` after `vercel link` |
| PAT | Created under `kuffelgr`, named `mom-garden`, repo scope |
| SSH | Not configured — HTTPS with macOS Keychain |

**Long-term recommendation**: consolidate to `gina-kuffel` as the single personal account, reconnect Claude connector, and delete `kuffelgr`.

---

## What Was Built

### Session 1 — March 2026

**Phase 1: Canvas prototype (abandoned)**
- Built single-file HTML/JS canvas app
- Attempted schematic house background — rejected
- Attempted photo overlay with pre-calibrated bed regions — rejected
- Attempted plant photos via canvas — CORS blocked
- Iterated through ~8 versions of coordinate calibration, never succeeded

**Phase 2: React + Vite app**
- `src/data/plants.js` — plant catalog (see current catalog below)
- `src/App.jsx` — main app with sidebar palette, click-to-place, drag-to-reposition, labels toggle, clear all
- `src/PlantDetail.jsx` — detail panel with bloom calendar, care info, photo

### Session 2 — April 2026

- **Vercel Blob photo storage** — uploaded bedA.jpeg, bedB.jpeg, whole-home.jpeg to Vercel Blob; removed dependency on local files or public/ folder
- **Default photo on load** — app now opens with Bed A loaded automatically; no longer requires manual photo upload
- **Bed view switcher** — toolbar now has three blue toggle buttons (Bed A — Home Front, Bed B — Garage Front, Whole Home); switching clears placed plants
- **Cover image mode** — changed `objectFit` from `contain` to `cover` so photos fill the canvas edge-to-edge with no black bars; `objectPosition: center` ensures centered crop

---

## Finalized Plant Plan

> ⚠️ Note: `src/data/plants.js` currently still contains the **original exploratory plant list** (Ninebark, Catmint, Rudbeckia, etc.). It has not yet been updated to reflect the finalized plan below. This is the highest-priority code update remaining.

### Bed B — Garage Front (~30ft × 4ft, north-facing, more open sky)

**Shrubs:**

| Plant | Cultivar | Count | Size | Notes |
|---|---|---|---|---|
| Virginia Sweetspire | *Itea virginica* 'Henry's Garnet' | 3 | 5′w × 3′h | Fall color, fragrant white racemes, clay tolerant |
| Oakleaf Hydrangea | *Hydrangea quercifolia* 'Pee Wee' | 1 | 4′w × 4′h | Entry anchor, exfoliating bark, 4-season interest |
| Arrowwood Viburnum | *Viburnum dentatum* 'Blue Muffin' | 3 | 5′w × 5′h | Native, blue berries, excellent fall color |
| Summersweet | *Clethra alnifolia* 'Hummingbird' | 2 | 3′w × 3′h | Fragrant, late summer bloom, deer resistant |

**Perennials:**

| Plant | Cultivar | Count | Size | Notes |
|---|---|---|---|---|
| Astilbe | *Astilbe* 'Fanal' | 5 | 2′w × 2′h | Deep red plumes June–July |
| Coral Bells | *Heuchera* 'Palace Purple' | 5 | 1.5′w × 1.5′h | Deep burgundy foliage |
| Bleeding Heart | *Lamprocapnos spectabilis* 'Gold Heart' | 4 | 2′w × 2′h | Spring bloom, gold foliage |
| Native Ferns | *Matteuccia struthiopteris* (Ostrich Fern) | ~18 | 3′w × 4′h | Mass planting, structural fill |

**Total Bed B: ~37 plants, 8 species**

### Bed A — Home Front (~30ft × 2ft, north-facing, shadier, eave overhang, basement window)

Single staggered row of perennials and ground covers:

| Plant | Cultivar | Count | Spacing | Notes |
|---|---|---|---|---|
| Lungwort | *Pulmonaria* 'Trevi Fountain' | 5 | 18″ | Blue flowers early spring, spotted foliage |
| Bleeding Heart | *Lamprocapnos spectabilis* 'Gold Heart' | 5 | 18″ | Shared with Bed B |
| Coral Bells — Palace Purple | *Heuchera* 'Palace Purple' | 3 | 15″ | Deep burgundy, alternating rhythm |
| Coral Bells — Caramel | *Heuchera* 'Caramel' | 3 | 15″ | Warm amber, alternating rhythm |
| Coral Bells — Lime Rickey | *Heuchera* 'Lime Rickey' | 2 | 15″ | Chartreuse, end accents |
| Wild Ginger | *Asarum canadense* | 6 | 12″ | Native ground cover, deep shade |
| Bugleweed | *Ajuga reptans* 'Black Scallop' | 8 | 12″ | Purple foliage, spreads to fill |

**Total Bed A: ~32 plants, 5 species**

**Coral Bells alternating pattern**: Palace Purple × 3, Caramel × 3, Lime Rickey × 2 — staggered for visual rhythm against red brick.

---

## Current Plant Catalog in App (`src/data/plants.js`)

> This is the **exploratory list** — predates the finalized plan. Needs to be replaced.

- Cherry Bomb Ninebark (*Physocarpus opulifolius* 'Jefam') — 5′w × 5′h
- Incrediball Hydrangea (*Hydrangea arborescens* 'Abetwo') — 5′w × 4′h
- Little Lime Hydrangea (*Hydrangea paniculata* 'Jane') — 4′w × 5′h
- Walker's Low Catmint (*Nepeta x faassenii* 'Walker's Low') — 3′w × 2′h
- Rozanne Geranium (*Geranium* 'Gerwat') — 3′w × 1.5′h
- Goldsturm Black-Eyed Susan (*Rudbeckia fulgida* 'Goldsturm') — 2′w × 2.5′h
- Karl Foerster Grass (*Calamagrostis x acutiflora* 'Karl Foerster') — 2′w × 5′h
- Prairie Dropseed (*Sporobolus heterolepis*) — 2.5′w × 2′h
- Autumn Fire Sedum (*Hylotelephium* 'Herbstfreude') — 2′w × 2′h ⚠️ clay caution

---

## Reference Photos

Three photos taken March 2026 (early spring, no deciduous foliage).

| File | View | Orientation |
|---|---|---|
| `bedA.jpeg` | Front bed close-up | Portrait, shows Bed A mulch strip at base of brick |
| `bedB.jpeg` | Garage/side bed | Portrait, siding face, single window |
| `whole-home.jpeg` | Full street view | Landscape, shows complete property |

All stored in Vercel Blob (see URLs above). Not committed to git.

---

## Soil Prep Plan (Pre-Planting, Memorial Day Weekend)

- University of Illinois Extension soil test (~$20) before amending
- Till to 12 inches
- Incorporate 4 inches of compost
- Mycorrhizal inoculant at planting
- Target planting window: Memorial Day weekend through early June

---

## Local Nursery Sources

- **Lurvey Garden Center** — Des Plaines, IL (primary)
- **The Growing Place** — Naperville / Aurora, IL (secondary)

---

## Local Development

```bash
git clone https://github.com/gina-kuffel/mom-garden-planner.git
cd mom-garden-planner
npm install
npm run dev
# → http://localhost:5173
```

To pull latest Claude changes locally:
```bash
git pull origin main
```

---

## Backlog

- [ ] **Update `plants.js`** to finalized plant plan (Bed A + Bed B species) — highest priority
- [ ] **Bed-specific plant filtering** — sidebar shows only plants assigned to the active bed view
- [ ] **Plant count indicator** — show placed count vs. target quantity per species
- [ ] **Plant size slider** — adjust circle size per placed plant
- [ ] **Season view** — toggle to show which plants are blooming in a selected month
- [ ] **Save/restore layout** — persist placed plants to localStorage
- [ ] **Print/export** — save overlay as image for sharing
- [ ] **Mobile/touch support** — touch drag for iPad use at the nursery
- [ ] **Soil amendment callouts** — inline warnings when clay-sensitive plant is placed
- [x] ~~Multiple bed views~~ — done (Bed A / Bed B / Whole Home switcher)
- [x] ~~Default photo on load~~ — done (Bed A loads automatically)
- [x] ~~Photo storage~~ — done (Vercel Blob)

---

*Last updated: April 2026*
