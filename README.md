# Live Shows in Chicago — GitHub Pages version

A plain static export of the Muse "Live Shows in Chicago" Space.
No build step, no server, no dependencies. Just HTML + CSS + JavaScript.

## Files
- `index.html` — page structure
- `styles.css` — all styling
- `app.js` — rendering, category/search filters, "Interested?" handling, "Not interested in this artist" hiding (on every card, including untracked "More in Chicago" acts) with a Removed artists restore list
- `data.js` — the shows + watch list. **This is the only file you edit to update the page.**

Snapshot in this copy: 2026-11-15 — 33 shows, 75 tracked artists.
Personal calendar-conflict details from the Space are *not* included in this public version.

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
- **No backend:** "Interested?" picks and "Not interested" artist hides save
  in the visitor's browser only (localStorage). They don't sync back to
  Muse or across devices.
- **No auto-refresh:** GitHub Pages can't run the Space's refresh. The page
  is a snapshot until `data.js` is replaced.
- **No private calendar check:** conflict lines from the Space were stripped
  for privacy — don't publish those publicly.

## Local preview
Open `index.html` in a browser, or run: `python3 -m http.server` in this folder.
