import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

/** `VITE_BASE=/listo` no workflow do Pages; local e Tailscale ficam na raiz. */
function normalizarBase(valor: string | undefined): string {
  if (!valor || valor === "/") return "/";
  const comBarra = valor.startsWith("/") ? valor : `/${valor}`;
  return comBarra.endsWith("/") ? comBarra : `${comBarra}/`;
}

/**
 * O oráculo congelado exige `/sw.js`, `start_url: "/"` e o manifesto na raiz do fonte.
 * No GitHub Pages o site vive em `/listo/`, então o prefixo entra só no dist.
 */
function prefixarDist(base: string): Plugin {
  const prefixo = base.replace(/\/$/, "");
  return {
    name: "listo-prefixar-dist",
    apply: "build",
    closeBundle() {
      if (!prefixo) return;
      const dist = path.resolve("dist");

      const htmlPath = path.join(dist, "index.html");
      const html = fs.readFileSync(htmlPath, "utf8").replace(
        /(href|src)="(\/[^"]*)"/g,
        (todo, attr: string, url: string) => {
          if (url.startsWith("//") || url.startsWith(`${prefixo}/`)) return todo;
          return `${attr}="${prefixo}${url}"`;
        },
      );
      fs.writeFileSync(htmlPath, html);
      fs.writeFileSync(path.join(dist, "404.html"), html);

      const manifestoPath = path.join(dist, "manifest.webmanifest");
      const manifesto = JSON.parse(fs.readFileSync(manifestoPath, "utf8")) as {
        start_url: string;
        scope: string;
        icons: Array<{ src: string }>;
      };
      manifesto.start_url = `${prefixo}/`;
      manifesto.scope = `${prefixo}/`;
      for (const icone of manifesto.icons) {
        if (icone.src.startsWith("/") && !icone.src.startsWith(`${prefixo}/`)) {
          icone.src = `${prefixo}${icone.src}`;
        }
      }
      fs.writeFileSync(manifestoPath, `${JSON.stringify(manifesto, null, 2)}\n`);

      const swPath = path.join(dist, "sw.js");
      const sw = fs
        .readFileSync(swPath, "utf8")
        .replaceAll('"/index.html"', `"${prefixo}/index.html"`)
        .replaceAll('"/manifest.webmanifest"', `"${prefixo}/manifest.webmanifest"`)
        .replaceAll('"/icons/', `"${prefixo}/icons/`)
        .replaceAll('["/",', `["${prefixo}/",`)
        .replaceAll('caches.match("/")', `caches.match("${prefixo}/")`);
      fs.writeFileSync(swPath, sw);

      const assets = path.join(dist, "assets");
      for (const nome of fs.readdirSync(assets)) {
        if (!nome.endsWith(".js")) continue;
        const arquivo = path.join(assets, nome);
        const codigo = fs
          .readFileSync(arquivo, "utf8")
          .replaceAll('"/sw.js"', `"${prefixo}/sw.js"`)
          .replaceAll("'/sw.js'", `'${prefixo}/sw.js'`)
          .replaceAll("`/sw.js`", `\`${prefixo}/sw.js\``);
        fs.writeFileSync(arquivo, codigo);
      }
    },
  };
}

const base = normalizarBase(process.env.VITE_BASE);

export default defineConfig({
  base,
  plugins: [react(), prefixarDist(base)],
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
