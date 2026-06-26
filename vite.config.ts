import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages this is served from a project subpath
// (https://<user>.github.io/songbook/), so the production build needs
// `base: "/songbook/"`. Dev stays at the root for a clean localhost URL.
// `import.meta.env.BASE_URL` reflects this, and the OAuth redirect is derived
// from it (see src/surface.ts), so both environments stay consistent.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/songbook/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
  },
}));
