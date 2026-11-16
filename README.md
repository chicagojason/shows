# Live Shows in Chicago — GitHub Pages version

A plain static export of the Muse "Live Shows in Chicago" Space.
No build step, no server, no dependencies. Just HTML + CSS + JavaScript.

## Files
- `index.html` — page structure (header, category toggle nav, shows, plays, watch list)
- `styles.css` — all styling, including thumbnails and ignored-card graying
- `app.js` — rendering; category toggles (Comics / Concerts / Plays, remembered in the browser); category/search filters; "Interested?" handling; an "Ignore" button on every card that grays out / desaturates it; "Not interested in this artist" hiding (on every show card, including untracked "More in Chicago" acts) with a Removed artists restore list
- `data.js` — the shows, plays + watch list. **This is the only file you edit to update the listings.**

Snapshot in this copy: 2026-11-15 — 31 shows visible (33 show records; Leanne Morgan and Nickelback belong to removed artists and start hidden, restorable below), 25 plays, 75 tracked artists.
Personal calendar-conflict details from the Space are *not* included in this public version.

## What's on the page
- **Shows** — comedians, concerts and local acts, one card per performance, grouped by month. Past dates fall off automatically.
- **On stage in Chicago** — plays & musicals from Goodman, Steppenwolf and Broadway In Chicago, one card per production for its full run (never per performance), split into "Now playing" and "Coming soon," with run dates, theater, description and cast/creative standouts. Runs that have ended fall off automatically.
- **Thumbnails** — cards lead with the production's/artist's own promotional artwork (hotlinked, verified 2026-11-15). Where no usable artwork exists yet — FEAST!, 'night, Mother, Ellen B. and The Night Fawn among the plays, and CC & The Madman among the shows — the card renders a playbill-style fallback instead.
- **Top toggles** — Comics / Concerts / Plays switches in the sticky nav hide or show whole categories; choices are remembered in the browser.

## Publish on GitHub Pages
1. Create a new GitHub repo (e.g. `live-shows-chicago`). Public repo = free Pages.
2. Upload these 5 files to the root of the repo (Add file → Upload files, or `git push`).
3. In the repo: **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)** → Save
4. Wait ~1 minute. Your page will be at:
   `https://<your-username>.github.io/live-shows-chicago/`

## Updating shows
Edit `data.js` and push. Or ask Muse to regenerate `data.js` from the Space
after a refresh (the Space still refreshes every 4 days — next: Wed Nov 18, 2026)
and drop the new file in.

## What changes on GitHub vs. the Muse Space
- **No backend:** "Interested?" picks, "Ignore" grays, category toggles and
  "Not interested" artist hides save in the visitor's browser only
  (localStorage). They don't sync back to Muse or across devices.
- **No auto-refresh:** GitHub Pages can't run the Space's refresh. The page
  is a snapshot until `data.js` is replaced.
- **No private calendar check:** conflict lines from the Space were stripped
  for privacy — don't publish those publicly.

## Local preview
Open `index.html` in a browser, or run: `python3 -m http.server` in this folder.
