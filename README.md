# Bhavya Agrawal — Portfolio

Same design as the original single-file mockup, rebuilt as a proper
**React (Vite) + Node (Express)** app. The design/CSS is untouched —
only the code structure changed.

## Structure

```
bhavya-portfolio/
├── client/          React app (Vite)
│   └── src/
│       ├── components/   One component per section (Hero, WorkGrid, etc.)
│       ├── hooks/         useTimecode, useReveal (scroll animation), useSiteData
│       ├── data/          Local fallback content (used if API is unreachable)
│       └── index.css      All design/styles — unchanged from the original
├── server/          Express API
│   ├── data/*.json  Editable content: site copy, work items, record stats
│   └── routes/api.js
└── package.json     Root scripts to run both together
```

## Why a Node backend at all?

The site's content (projects, the Guinness World Record
stats) now lives in plain JSON files in `server/data/`, served through a
small Express API. That means once you have Bhavya's real project list,
you edit the JSON files — no React code changes needed.

If you'd rather skip the backend and hardcode everything into React,
that's also fine: `client/src/data/fallbackData.js` has the same shape
and the app will use it automatically if the API isn't running.

## Environment variables

Neither app ships with a real `.env` file — only `.env.example` templates,
since there's nothing secret to store yet (no API keys, no database).
`.env` itself is gitignored on purpose so nobody accidentally commits
real secrets later.

To set one up:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env   # optional — only needed for split deploys
```

Then open `server/.env` and adjust values — e.g. change `PORT`, or fill in
email credentials once the contact form is wired up to actually send mail.
Restart `npm run dev` after editing `.env` for changes to take effect.

## Getting started

```bash
npm run install:all   # installs both client and server dependencies
npm run dev            # runs Express (port 4000) + Vite (port 5173) together
```

Open http://localhost:5173 — the client proxies `/api/*` requests to the
Express server automatically in dev.

## Editing content

Edit these files directly, no rebuild step needed in dev (just refresh):

- `server/data/site.json` — name, hero copy, nav marquee, contact email, socials
- `server/data/work.json` — each project: title, category, spec line, and
  `span` (8/6/4 — controls grid width) / `tall` / `letterbox` flags to
  match the original layout's mixed card sizes
- `server/data/record.json` — the Guinness World Records section (replace
  the `[X]` placeholders with verified numbers)
- `server/data/about.json` — bio paragraphs (`**text**` renders bold) and the spec/kit list

## Adding real footage

Each entry in `work.json` has empty `thumbnail` and `videoUrl` fields,
ready for when there's real media to point to (e.g. a Cloudinary/Vimeo
URL). The `WorkCard` component currently renders a styled placeholder
frame — swap in an `<img>`/`<video>` once URLs are available.

## Production build

```bash
npm run build   # builds the React app into client/dist
npm start        # builds, then starts Express serving the built app + API on one port
```

In production Express serves the compiled React app directly, so there's
just one server/one port to deploy.
