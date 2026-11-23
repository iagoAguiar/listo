import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // preview é servido pelo Tailscale (host .ts.net) para validar o MVP no celular
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    globals: true,
  },
});