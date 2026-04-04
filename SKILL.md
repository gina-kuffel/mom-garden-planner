# Mom's Garden Planner — Project Log
*Running record of decisions, architecture, and work completed*

---

## Project Overview

An interactive garden bed planning tool for a brick split-level home in Arlington Heights, IL (Zone 6a/6b). The goal is to visualize plant placement over actual photos of the house before committing to a design.

**Live app**: https://mom-garden-planner.vercel.app/
**Repo**: https://github.com/gina-kuffel/mom-garden-planner

---

## ⭐ Standard Setup for New Personal Projects

This section documents the correct setup pattern for all future personal projects. Follow this every time.

### The Two-Account Problem

The developer has two GitHub accounts:
- `gina-kuffel` — personal primary account, authenticated in Mac Keychain, connected to Vercel
- `kuffelgr` — secondary account, authenticated as Claude's GitHub connector

These two accounts being separate causes friction if not handled correctly from the start.

### ✅ Correct Setup Pattern (use this every time)

**Step 1 — Create the repo under `gina-kuffel`**
Log into GitHub as `gina-kuffel` and create the repo at github.com/new. Make it public. Do NOT initialize with a README.

**Step 2 — Add `kuffelgr` as a collaborator with Write access**
Go to: `https://github.com/gina-kuffel/REPO-NAME/settings/access`
- Click **Add people**
- Search for `kuffelgr`
- Set role to **Write**
- Click **Add kuffelgr to this repository**

Then log into GitHub as `kuffelgr` and accept the invitation at github.com/notifications (or via email).

**Step 3 — Claude pushes directly to `gina-kuffel/REPO-NAME`**
With `kuffelgr` as a collaborator, Claude's connector can now push commits directly to the repo under `gina-kuffel`. No manual git pull/push required.

**Step 4 — Connect Vercel to `gina-kuffel/REPO-NAME`**
Go to vercel.com → New Project → paste `https://github.com/gina-kuffel/REPO-NAME` directly into the import field (don't use the account dropdown, which may show the wrong account). Every commit Claude pushes will now auto-deploy.

### Why This Works

Vercel is connected to `gina-kuffel`, so it watches repos under that account for push events and auto-deploys. Claude's connector is `kuffelgr`, but with Write collaborator access to a `gina-kuffel` repo, Claude can commit directly. Result: Claude commits → Vercel auto-deploys → no manual steps needed.

### What NOT to Do

- ❌ Don't create the repo under `kuffelgr` — Vercel won't auto-deploy from it
- ❌ Don't try to transfer a repo from `kuffelgr` to `gina-kuffel` — GitHub blocks it if a fork already exists under that name
- ❌ Don't rely on `git push gina main` as a manual workaround — it works but it's friction
- ❌ Don't connect Vercel by pasting a `kuffelgr` URL — it deploys once but has no webhook for auto-deploy

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

CRA is officially deprecated. Vite is the current standard, builds faster, and Vercel handles it identically. The deploy experience is the same from the user's perspective.

### Wikimedia Image Proxy

Wikimedia blocks hotlink requests from unknown domains. Plant photos are routed through a Vercel serverless function at `/api/image-proxy` which fetches images server-side with a `Referer: https://en.wikipedia.org/` header, bypassing the hotlink protection. Images are cached for 24 hours.

---

## What Was Built

### Session 1 — March 2026

**Phase 1: Canvas prototype (abandoned)**
- Built a single-file HTML/JS canvas app
- Attempted schematic house background drawing — rejected as too cartoonish
- Attempted photo overlay with pre-calibrated bed regions — rejected, bed outline never landed correctly
- Attempted plant photo rendering via canvas — blocked by CORS
- Iterated through ~8 versions of bed Y-coordinate calibration, never got it right

**Phase 2: React app (current)**

`src/data/plants.js` — master plant catalog with 9 plants:
- Cherry Bomb Ninebark (*Physocarpus opulifolius* 'Jefam') — 5′w × 5′h, shrub
- Incrediball Hydrangea (*Hydrangea arborescens* 'Abetwo') — 5′w × 4′h, shrub
- Little Lime Hydrangea (*Hydrangea paniculata* 'Jane') — 4′w × 5′h, shrub
- Walker's Low Catmint (*Nepeta x faassenii* 'Walker's Low') — 3′w × 2′h, perennial
- Rozanne Geranium (*Geranium* 'Gerwat') — 3′w × 1.5′h, perennial
- Goldsturm Black-Eyed Susan (*Rudbeckia fulgida* 'Goldsturm') — 2′w × 2.5′h, perennial
- Karl Foerster Grass (*Calamagrostis x acutiflora* 'Karl Foerster') — 2′w × 5′h, grass
- Prairie Dropseed (*Sporobolus heterolepis*) — 2.5′w × 2′h, grass
- Autumn Fire Sedum (*Hylotelephium* 'Herbstfreude') — 2′w × 2′h, perennial ⚠️ clay caution

`src/App.jsx` — main application:
- Sidebar plant palette with circular photo thumbnails
- Click plant to select, click photo to place
- Drag to reposition placed plants
- ✕ button to remove individual plants
- Labels ON/OFF toggle
- Clear all button
- Contextual toolbar hint text

`src/PlantDetail.jsx` — detail panel:
- Shows when a plant is clicked in the sidebar
- Full photo, botanical name, mature size, sun/water, zone, clay tolerance, deer resistance
- 12-month bloom calendar bar

`api/image-proxy.js` — Vercel serverless function:
- Proxies Wikimedia image requests to bypass hotlink protection
- Whitelists only `upload.wikimedia.org` and `commons.wikimedia.org`
- Caches responses for 24 hours

---

## Plant Selection Rationale

All plants confirmed Zone 6a/6b hardy. All selected for:
- Low to moderate maintenance
- Clay soil tolerance (noted where amendment needed)
- Four-season interest
- Deer resistance (moderate to high for all)
- Appropriate scale for a residential foundation planting

### Front Main Bed (large brick face, basement window centered)
Approx. 24′ wide × 4′ deep, full sun to part sun

| Plant | Role | Notes |
|---|---|---|
| Cherry Bomb Ninebark | Left anchor shrub | Bold burgundy foliage, season-long contrast |
| Incrediball Hydrangea | Left-center shrub | Large white blooms July–Sept |
| Karl Foerster Grass | Vertical punctuation × 2 | Flanking window, winter structure |
| Walker's Low Catmint | Front edge drift | Long blooming, deer resistant |
| Rozanne Geranium | Front edge right | Blooms May–frost |
| Little Lime Hydrangea | Right-center shrub | Lime-to-pink color shift |
| Goldsturm Black-Eyed Susan | Right side mid-border | Golden yellow, feeds birds in winter |

### Side Bed (siding face, single window, currently bare)
Approx. 18′ wide × 3′ deep, full sun

| Plant | Role | Notes |
|---|---|---|
| Karl Foerster Grass | Left anchor × 2 | Vertical structure against flat siding |
| Goldsturm Black-Eyed Susan | Mid-bed mass × 3 | Clay tolerant workhorse |
| Prairie Dropseed | Right side × 2 | Fine-textured native, orange fall color |
| Walker's Low Catmint | Front edge | Low maintenance lavender drift |
| Autumn Fire Sedum | Front edge right | Late color; amend soil with grit |

---

## Reference Photos

Three photos taken March 2026, early spring (no foliage on deciduous trees):

| File | View | Notes |
|---|---|---|
| `bedA.jpeg` | Front bed close-up | Portrait orientation, mulch strip visible at base of brick |
| `wholehome.jpeg` | Full street view | Shows complete property, front and side |
| `bedB.jpeg` | Side bed | Siding face, single window, currently bare dirt/snow |

Photos are stored locally — not committed to the repo (too large, not needed for deployment).

---

## Local Development

```bash
git clone https://github.com/gina-kuffel/mom-garden-planner.git
cd mom-garden-planner
npm install
npm run dev
# → http://localhost:5173
```

To pull latest changes committed by Claude:
```bash
git pull
# then refresh browser
```

---

## Next Steps / Backlog

- [ ] Plant size slider — adjust circle size per placed plant
- [ ] Season view — toggle to show which plants are blooming in a selected month
- [ ] Save/restore layout — persist placed plants to localStorage
- [ ] Multiple bed views — switch between front and side bed reference photos
- [ ] Print/export — save the overlay as an image for sharing with mom
- [ ] Nursery sourcing — add local IL nursery recommendations per plant
- [ ] Soil amendment notes — inline callouts when a clay-sensitive plant is placed
- [ ] Mobile support — touch drag for iPad use at the nursery

---

*Last updated: April 2026*
