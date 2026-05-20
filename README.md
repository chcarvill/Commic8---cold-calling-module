# Communic8 — Module: Cuban-style Cold Calling

A standalone cold calling command centre for life coaches.

## Files

```
communic8/
├── index.html        — Main app
├── app.css           — Styles (supports light + dark mode)
├── app.js            — All application logic
├── data.json         — Default data (editable)
├── manifest.json     — Web app manifest (installable as PWA)
├── README.md         — This file
└── icons/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-64.png
    ├── icon-128.png
    ├── icon-192.png
    └── icon-512.png
```

## How to use

**Option A — Open directly in browser**
Just double-click `index.html`. Works in any modern browser with no server needed.

**Option B — Install as a PWA**
Serve from a local server (e.g. `python3 -m http.server 8080` then open `localhost:8080`),
then use your browser's "Install app" option to add it to your home screen or desktop.

## Features

- **Preparation tab** — weekly hours, pre-call checklist, your pitch — all editable
- **Location tab** — location details, transport options — all editable
- **Setup tab** — packing list, nearby amenities — all editable
- **Prospects tab** — add prospects, mark as ACMA-washed, track status, email list to yourself
- **Cold Calling tab** — call log with per-call checkboxes, outcome tagging, live stats, mid-session check-ins

## Data persistence

All data saves automatically to your browser's localStorage.
Use the **Export** button to download a JSON backup.
To reset to defaults, clear the `communic8_data` key from your browser's localStorage.

## ACMA / Do Not Call Register

You have an ACMA account — wash your prospect list at **donotcall.gov.au** before calling.
Mark each number as "Washed" in the Prospects tab once confirmed.

---

*Built for Chris — sit at the table, make the calls.*
