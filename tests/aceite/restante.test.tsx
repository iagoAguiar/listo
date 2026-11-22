import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { criarBanco } from "../../src/dados/db";
import { criarRepositorio, type Repositorio } from "../../src/dados/repositorio";
import App from "../../src/ui/App";
import { ProvedorRepositorio } from "../../src/ui/Provedor";

let contador = 0;

async function novoAmbiente(): Promise<{ repo: Repositorio; user: ReturnType<typeof userEvent.setup> }> {
  const db = criarBanco(`ui-resto-${contador++}`);
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

const listaBase = {
  nome: "Compras do mês",
  data: "2026-11-22",
  tipo: "mensal" as const,
  orcamentoCentavos: 40000,
  formaPagamento: "pix" as const,
};

describe("R6: editar lista", () => {
  it("altera nome e orçamento preservando os itens já adicionados", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}/editar`, repo);

    const nome = await screen.findByLabelText(/nome da lista/i);
    await user.clear(nome);
    await user.type(nome, "Compras de dezembro");
    const orcamento = screen.getByLabelText(/orçamento/i);
    await user.clear(orcamento);
    await user.type(orcamento, "500,00");
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(async () => {
      const atualizada = await repo.obterLista(lista.id);
      expect(atualizada?.nome).toBe("Compras de dezembro");
      expect(atualizada?.orcamento_centavos).toBe(50000);
    });
    expect(await repo.listarItens(lista.id)).toHaveLength(1);
  });
});

describe("R7: excluir lista exige confirmação", () => {
  it("pede confirmação explícita e apaga a lista com os itens", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}`, repo);

    await user.click(await screen.findByRole("button", { name: /excluir lista/i }));
    await user.click(screen.getByRole("button", { name: /confirmar exclusão/i }));

    await waitFor(async () => expect(await repo.listarListas()).toHaveLength(0));
    expect(await repo.listarItens(lista.id)).toHaveLength(0);
  });
});

describe("R20: iniciar compra", () => {
  it("muda o status para comprando e abre o modo compra", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}`, repo);

    await user.click(await screen.findByRole("link", { name: /iniciar compra/i }));

    expect(await screen.findByTestId("valor-final")).toBeInTheDocument();
    await waitFor(async () => expect((await repo.obterLista(lista.id))?.status).toBe("comprando"));
  });
});

describe("R21 / R22: cabeçalho duplo e item marcado no fim", () => {
  it("mostra Total estimado e Total no carrinho e joga o marcado para o fim da lista", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    const a = await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1000 });
    await repo.adicionarItem(lista.id, { nome: "Banana", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1000 });
    await repo.adicionarItem(lista.id, { nome: "Café", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1000 });

    renderizar(`/listas/${lista.id}/compra`, repo);

    expect(await screen.findByText("Total estimado")).toBeInTheDocument();
    expect(screen.getByText("Total no carrinho")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /arroz/i }));

    await waitFor(() => {
      const linhas = screen.getAllByTestId(/^linha-item-/);
      expect(linhas.map((linha) => linha.getAttribute("data-testid"))).toEqual([
        "linha-item-banana",
        "linha-item-cafe",
        "linha-item-arroz",
      ]);
    });
    expect(await repo.listarAdquiridos(lista.id)).toHaveLength(1);
    expect(a.nome).toBe("Arroz");
  });
});

describe("R23: preço e quantidade editáveis no modo compra", () => {
  it("recalcula o total ao mudar o preço do item", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 2000, precoUnitarioCentavos: 1250 });

    renderizar(`/listas/${lista.id}/compra`, repo);

    const preco = await screen.findByLabelText(/preço de arroz/i);
    await user.clear(preco);
    await user.type(preco, "20,00");
    await user.tab();

    await waitFor(() => expect(screen.getByTestId("valor-final")).toHaveTextContent("R$ 40,00"));
    const itens = await repo.listarItens(lista.id);
    expect(itens[0]?.preco_unitario_centavos).toBe(2000);
  });
});

describe("R24 / R25: item rápido no modo compra", () => {
  it("adiciona já marcado como adquirido e soma no carrinho", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}/compra`, repo);

    await user.click(await screen.findByRole("button", { name: "+" }));
    await user.type(screen.getByLabelText(/novo item/i), "Sabão");
    await user.type(screen.getByLabelText(/^preço$/i), "9,99");
    expect(screen.getByLabelText(/salvar este produto no meu catálogo/i)).toBeChecked();
    await user.click(screen.getByRole("button", { name: /adicionar e marcar/i }));

    await waitFor(async () => expect(await repo.listarItens(lista.id)).toHaveLength(2));
    const itens = await repo.listarItens(lista.id);
    expect(itens[1]?.nome).toBe("Sabão");
    expect(itens[1]?.adquirido).toBe(true);
    await waitFor(() => expect(screen.getByTestId("no-carrinho")).toHaveTextContent("R$ 9,99"));
  });
});

describe("R34: detalhe de lista concluída", () => {
  it("mostra o valor final e a marca de adquirido de cada item", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    const arroz = await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 2000, precoUnitarioCentavos: 1250 });
    await repo.adicionarItem(lista.id, { nome: "Café", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1999 });
    await repo.marcarAdquirido(arroz.id, true);
    await repo.concluirLista(lista.id);

    renderizar(`/listas/${lista.id}`, repo);

    expect(await screen.findByTestId("valor-final")).toHaveTextContent("R$ 44,99");
    expect(screen.getAllByTestId("marca-adquirido")).toHaveLength(1);
    expect(screen.getAllByTestId("marca-pendente")).toHaveLength(1);
  });
});

describe("R17: saldo com sinal", () => {
  it("diz quanto sobra abaixo do orçamento", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista({ ...listaBase, orcamentoCentavos: 4000 });
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}`, repo);

    expect(await screen.findByTestId("saldo")).toHaveTextContent("R$ 15,00");
    expect(screen.getByText(/abaixo do orçamento/i)).toBeInTheDocument();
  });

  it("diz quanto estourou acima do orçamento", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista({ ...listaBase, orcamentoCentavos: 1000 });
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    renderizar(`/listas/${lista.id}`, repo);

    expect(await screen.findByTestId("saldo")).toHaveTextContent("R$ 15,00");
    expect(screen.getByText(/acima do orçamento/i)).toBeInTheDocument();
  });
});

describe("CA-R10 / CA-R11: sugestão do catálogo no detalhe", () => {
  it("sugere produto já usado e preenche o preço com o último preço", async () => {
    const { repo, user } = await novoAmbiente();
    const anterior = await repo.criarLista({ ...listaBase, nome: "Compra antiga" });
    await repo.adicionarItem(anterior.id, { nome: "Leite Integral", quantidadeMilesimos: 1000, precoUnitarioCentavos: 749 });

    const lista = await repo.criarLista(listaBase);
    renderizar(`/listas/${lista.id}`, repo);

    await user.type(await screen.findByLabelText(/^item$/i), "leite");
    await user.click(await screen.findByRole("button", { name: /leite integral/i }));

    expect(screen.getByLabelText(/preço unitário/i)).toHaveValue("7,49");
  });
});

describe("R33: início sem compras oferece criar a primeira lista", () => {
  it("mostra o CTA de primeira lista", async () => {
    const { repo } = await novoAmbiente();
    renderizar("/", repo);
    expect(await screen.findByRole("link", { name: /criar primeira lista/i })).toBeInTheDocument();
  });
});

describe("R43 / R44: backup em JSON", () => {
  it("exporta listas, itens e produtos em um JSON válido", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });

    const bruto = await repo.exportarBackup();
    const backup = JSON.parse(bruto) as { versao: number; listas: unknown[]; itens: unknown[]; produtos: unknown[] };

    expect(backup.versao).toBe(1);
    expect(backup.listas).toHaveLength(1);
    expect(backup.itens).toHaveLength(1);
    expect(backup.produtos).toHaveLength(1);
  });

  it("importa acrescentando com identificadores novos, sem sobrescrever", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });
    const bruto = await repo.exportarBackup();

    const resultado = await repo.importarBackup(bruto);

    expect(resultado.importados).toBe(1);
    const listas = await repo.listarListas();
    expect(listas).toHaveLength(2);
    const importada = listas.find((registro) => registro.id !== lista.id);
    expect(importada?.nome).toBe("Compras do mês");
    const itensImportados = await repo.listarItens(importada?.id ?? "");
    expect(itensImportados).toHaveLength(1);
    expect(itensImportados[0]?.id).not.toBe(lista.id);
  });

  it("recusa JSON inválido sem gravar nada", async () => {
    const { repo } = await novoAmbiente();
    await expect(repo.importarBackup("{ nem json é }")).rejects.toThrow(/backup inválido/i);
    expect(await repo.listarListas()).toHaveLength(0);
  });
});