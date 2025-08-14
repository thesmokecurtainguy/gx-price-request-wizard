# GX Price Request Wizard (v0.4)

- Stoebich-branded UI + email
- CSV sizing import (per-submission override)
- Shipping ZIP + freight notes
- Rail width logic + GX model mapping (fallback)
- Fraction-style inch inputs (e.g., `2-7/8`) and Feet→Inches helper (manual)
- Curtain height: ≤120" → 10', 121–144" → 12', >144" → RFI

## Run
npm install
npm run dev

## Deploy
Vercel → add env vars from `.env.example`

## Sizing Table CSV
Columns (inches): `min_clear_width,max_clear_width,min_frame_width,max_frame_width,min_frame_projection,max_frame_projection,mount_type,gx_model,notes`
Mount type: `stub-rails` or `aux-rails`.
