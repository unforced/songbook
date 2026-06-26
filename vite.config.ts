import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite's default `appType: "spa"` serves index.html for unknown routes, so the
// OAuth redirect lands on /oauth/callback and React handles it client-side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
