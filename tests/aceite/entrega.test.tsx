import "fake-indexeddb/auto";
import fs from "node:fs";
import path from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { criarBanco } from "../../src/dados/db";
import { criarRepositorio, type Repositorio } from "../../src/dados/repositorio";
import App from "../../src/ui/App";
import { ProvedorRepositorio } from "../../src/ui/Provedor";

let contador = 0;

async function novoAmbiente(): Promise<{ repo: Repositorio; user: ReturnType<typeof userEvent.setup> }> {
  const db = criarBanco(`entrega-${contador++}`);
  await db.open();
  return { repo: criarRepositorio(db), user: userEvent.setup() };
}

function renderizar(rota: string, repo: Repositorio) {
  render(
    <ProvedorRepositorio repo={repo}>
      <MemoryRouter initialEntries={[rota]}>
        <App />
      </MemoryRouter>
    </ProvedorRepositorio>,
  );
}

const raiz = process.cwd();

function ler(relativo: string): string {
  return fs.readFileSync(path.join(raiz, relativo), "utf8");
}

const listaBase = {
  nome: "Compras do mês",
  data: "2026-11-22",
  tipo: "mensal" as const,
  orcamentoCentavos: 40000,
  formaPagamento: "pix" as const,
};

describe("R35 / R36 / R37: PWA instalável e offline", () => {
  it("tem manifesto com nome, ícones 192/512 e display standalone", () => {
    const manifesto = JSON.parse(ler("public/manifest.webmanifest")) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      theme_color: string;
      background_color: string;
      icons: Array<{ src: string; sizes: string; type: string }>;
    };

    expect(manifesto.name).toMatch(/ListO/i);
    expect(manifesto.display).toBe("standalone");
    expect(manifesto.start_url).toBe("/");
    expect(manifesto.theme_color).toBeTruthy();
    expect(manifesto.background_color).toBeTruthy();

    const tamanhos = manifesto.icons.map((icone) => icone.sizes);
    expect(tamanhos).toContain("192x192");
    expect(tamanhos).toContain("512x512");
    for (const icone of manifesto.icons) {
      expect(icone.type).toBe("image/png");
      expect(fs.existsSync(path.join(raiz, "public", icone.src.replace(/^\//, "")))).toBe(true);
    }
  });

  it("index.html aponta o manifesto, o tema e o ícone da tela inicial", () => {
    const html = ler("index.html");
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('rel="icon"');
  });

  it("service worker pré-cacheia o app shell e responde navegação offline", () => {
    const sw = ler("public/sw.js");
    expect(sw).toMatch(/addEventListener\("install"/);
    expect(sw).toMatch(/addEventListener\("fetch"/);
    expect(sw).toContain('"/index.html"');
    expect(sw).toContain('"/"');
    expect(sw).toMatch(/caches\.open/);
    expect(sw).toMatch(/mode === "navigate"|request\.mode/);
  });

  it("registra o service worker no bootstrap do app", () => {
    const main = ler("src/main.tsx");
    expect(main).toMatch(/serviceWorker\.register\("\/sw\.js"\)/);
  });
});

describe("R43: exportar backup pela tela de ajustes", () => {
  it("gera um JSON com as listas, itens e produtos", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, {
      nome: "Arroz",
      quantidadeMilesimos: 1000,
      precoUnitarioCentavos: 2500,
    });

    const criado: Blob[] = [];
    const objetoUrl = vi.fn(() => "blob:backup");
    const revogar = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: (blob: Blob) => {
      criado.push(blob);
      return objetoUrl();
    }, revokeObjectURL: revogar }));

    renderizar("/ajustes", repo);
    await user.click(await screen.findByRole("button", { name: /exportar backup/i }));

    await waitFor(() => expect(criado).toHaveLength(1));
    const texto = await criado[0]!.text();
    const backup = JSON.parse(texto) as { listas: unknown[]; itens: unknown[]; produtos: unknown[] };
    expect(backup.listas).toHaveLength(1);
    expect(backup.itens).toHaveLength(1);
    expect(backup.produtos).toHaveLength(1);
    expect(await screen.findByText(/backup gerado/i)).toBeInTheDocument();
  });
});

describe("R44: importar backup pela tela de ajustes", () => {
  it("valida o arquivo e acrescenta as listas com identificadores novos", async () => {
    const { repo, user } = await novoAmbiente();
    const origem = await novoAmbiente();
    const lista = await origem.repo.criarLista({ ...listaBase, nome: "Compra de outubro" });
    await origem.repo.adicionarItem(lista.id, {
      nome: "Café",
      quantidadeMilesimos: 1000,
      precoUnitarioCentavos: 1999,
    });
    const bruto = await origem.repo.exportarBackup();

    renderizar("/ajustes", repo);
    const campo = await screen.findByLabelText(/arquivo de backup/i);
    await user.upload(campo, new File([bruto], "backup.json", { type: "application/json" }));

    await waitFor(async () => expect(await repo.listarListas()).toHaveLength(1));
    const importadas = await repo.listarListas();
    expect(importadas[0]?.id).not.toBe(lista.id);
    expect(importadas[0]?.nome).toBe("Compra de outubro");
    expect(await screen.findByText(/lista importada/i)).toBeInTheDocument();
  });

  it("recusa arquivo inválido com mensagem e sem gravar", async () => {
    const { repo, user } = await novoAmbiente();

    renderizar("/ajustes", repo);
    const campo = await screen.findByLabelText(/arquivo de backup/i);
    await user.upload(campo, new File(["{ nada }"], "quebrado.json", { type: "application/json" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/backup inválido/i);
    expect(await repo.listarListas()).toHaveLength(0);
  });
});