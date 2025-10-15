# Eclipse of Realms — Mini 4X Hex (React)

Small one-week project with **React + Vite**.  
Move a hero on a hex map (axial `q,r`); terrains have different move costs.  
Press **End Turn**: a simple AI moves one step toward you.

---

## Why it fits HYF
- Multiple pages with client-side routing (`react-router-dom`)
- Context API + custom hooks (no class components)
- Async data loading (local JSON; optional Supabase)
- Clean README and presentable UI

---

## Quick Start
```bash
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

---

## Controls (Play page)

- Click an **adjacent** hex to move (AP cost depends on terrain).
- Click **End Turn** to reset AP and let the enemy step.

---

## Data

Default: local JSON in `public/data/`

- `terrains.json` → `{ id, moveCost, passable, color }`
- `map.json` → `{ q, r, terrainId }`
