import { createVaultSurface } from "@openparachute/surface-client";

// Redirect OAuth back to the app's own URL (the Vite base), not the default
// `${origin}/oauth/callback`. GitHub Pages has no SPA fallback, so a dedicated
// callback path would 404 there; the app's base path is a real document Pages
// serves, and App.tsx reads `?code&state` off it. Works in dev too:
//   dev   → http://localhost:5173/
//   Pages → https://<user>.github.io/songbook/
const redirectUri =
  typeof window !== "undefined"
    ? new URL(import.meta.env.BASE_URL, window.location.origin).href
    : undefined;

/**
 * One surface per (hub, vault). This songbook reads the music-practice vault
 * `default` hosted on the Parachute testing hub.
 *
 * - `hubUrl` must be set explicitly: it defaults to `window.location.origin`,
 *   which during local dev is http://localhost:5173 — not the hub. Point it at
 *   the hub that actually serves the vault.
 * - `vaultName` is this vault's name (see `vault-info`).
 *
 * There is no `parachute-mount` meta tag here, so the factory auto-detects the
 * standalone path and uses RFC 7591 Dynamic Client Registration — the consent
 * screen shows `clientName`, and the registered client is bound to
 * `${origin}/oauth/callback`.
 */
export const surface = createVaultSurface({
  clientName: "Songbook",
  hubUrl: import.meta.env.VITE_HUB_URL ?? "https://testing.parachute.computer",
  vaultName: import.meta.env.VITE_VAULT_NAME ?? "default",
  redirectUri,
});
