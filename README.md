# Songbook

A [Parachute](https://parachute.computer) **surface** — a small React web app —
over your music-practice vault. It reads the `#song` notes in the vault and lays
them out as a practice library: browse by where each song sits in your learning
journey, filter by instrument, and open any song to read its notes, chords, and
key.

It's read-focused and built on the two Parachute surface packages, so there's no
hand-rolled OAuth or note rendering:

- **[`@openparachute/surface-client`](https://www.npmjs.com/package/@openparachute/surface-client)**
  — `createVaultSurface(...)` handles sign-in (OAuth) and gives you a typed
  vault client (`queryNotes`, …).
- **[`@openparachute/surface-render`](https://www.npmjs.com/package/@openparachute/surface-render)**
  — `<NoteRenderer>` renders note markdown, wikilinks, and code the way the rest
  of the Parachute ecosystem does.

## What it shows

- **Status groups** — songs are grouped into _Learning → Wishlist → Learned_, so
  what you're actively working on sits on top.
- **At-a-glance rows** — each song shows its instrument (🪗 harmonium / 🎸
  guitar), difficulty, artist, key, and a 🎤 when you're also working on singing
  it.
- **Filters** — search by title/artist/key and filter by instrument.
- **Detail view** — the full note (lyrics, chords, practice tips) rendered as
  prose, with a small facts strip (status, instrument, key, singing).

The shape comes straight from the vault's `#song` schema (`status`,
`difficulty`, `play_on`, `sing`, `artist`, `key`) — see `src/song.ts`.

## Running it

A surface runs **in a real browser** because sign-in is an OAuth redirect to the
hub's consent screen and back. Run it locally:

```bash
npm install
npm run dev
```

Then open the dev URL (default http://localhost:5173), click **Sign in**, and
approve the "Songbook" client on the Parachute consent screen. On first run the
app self-registers with the hub via Dynamic Client Registration — no client
secret to configure.

### Configuration

The vault and hub are set in `src/surface.ts` and can be overridden with env
vars (e.g. an `.env.local`):

| Variable          | Default                              | Meaning                          |
| ----------------- | ------------------------------------ | -------------------------------- |
| `VITE_HUB_URL`    | `https://testing.parachute.computer` | Hub origin that serves the vault |
| `VITE_VAULT_NAME` | `default`                            | Vault name                       |

> `hubUrl` must be set explicitly — the library otherwise defaults it to the
> page origin (i.e. `localhost` during dev), which isn't the hub.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the Vite dev server             |
| `npm run build`     | Type-check (`tsc`) and build to `dist/` |
| `npm run preview`   | Serve the production build            |
| `npm run typecheck` | Type-check only                       |

## Project layout

```
src/
  surface.ts            createVaultSurface config (hub + vault)
  song.ts               #song note → typed Song projection + display helpers
  App.tsx               auth lifecycle, data load, app shell
  components/
    Library.tsx         filters, status groups, song rows
    SongDetail.tsx      note rendering + facts strip
  styles.css            songbook styling
```

## Deploying (GitHub Pages)

This repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds and publishes to GitHub Pages on every push to `main`. The site lives at:

> **https://unforced.github.io/songbook/**

Notes on how it's wired:

- **Base path.** The production build uses `base: "/songbook/"` (see
  `vite.config.ts`) so assets resolve under the project subpath. Dev stays at
  `/`.
- **OAuth redirect.** Sign-in redirects back to the app's own URL (the Vite base
  path), not a `…/oauth/callback` route — GitHub Pages has no SPA fallback, so a
  dedicated callback path would 404. The app reads `?code&state` off its base
  URL. The redirect URI is derived from `import.meta.env.BASE_URL` in
  `src/surface.ts`, so dev and Pages stay consistent.
- **Dynamic Client Registration.** The `github.io` origin self-registers with
  the hub on first sign-in — no secret to configure.

### One-time setup

The workflow enables Pages automatically (`actions/configure-pages` with
`enablement: true`). If the first run can't enable it, turn it on manually:
**repo → Settings → Pages → Build and deployment → Source: GitHub Actions**, then
re-run the workflow.

### Hub must allow the origin

Sign-in only works if the Parachute hub trusts the `https://unforced.github.io`
origin (CORS) and accepts the dynamically registered redirect URI. The local dev
origin (`http://localhost:5173`) and the Pages origin are separate registrations.
