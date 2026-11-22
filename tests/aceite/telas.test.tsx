import "fake-indexeddb/auto";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { criarBanco } from "../../src/dados/db";
import { criarRepositorio, type Repositorio } from "../../src/dados/repositorio";
import App from "../../src/ui/App";
import { ProvedorRepositorio } from "../../src/ui/Provedor";

let contador = 0;

async function novoAmbiente(): Promise<{ repo: Repositorio; user: ReturnType<typeof userEvent.setup> }> {
  const db = criarBanco(`ui-telas-${contador++}`);
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

describe("CA-R3: tela inicial sem listas", () => {
  it("mostra estado vazio e caminho para criar a primeira lista", async () => {
    const { repo } = await novoAmbiente();
    renderizar("/", repo);

    expect(await screen.findByText(/nenhuma compra/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nova lista/i })).toBeInTheDocument();
  });
});

describe("CA-R4: criar lista pela tela", () => {
  it("salva nome e orçamento e abre o detalhe da lista criada", async () => {
    const { repo, user } = await novoAmbiente();
    renderizar("/listas/nova", repo);

    await user.type(screen.getByLabelText(/nome da lista/i), "Compras do mês");
    await user.type(screen.getByLabelText(/orçamento/i), "400,00");
    await user.click(screen.getByRole("button", { name: /salvar lista/i }));

    expect(await screen.findByRole("heading", { name: "Compras do mês" })).toBeInTheDocument();
    expect(screen.getByTestId("orcamento")).toHaveTextContent("R$ 400,00");
  });

  it("avisa quando o orçamento está vazio e não cria a lista", async () => {
    const { repo, user } = await novoAmbiente();
    renderizar("/listas/nova", repo);

    await user.type(screen.getByLabelText(/nome da lista/i), "Sem orçamento");
    await user.click(screen.getByRole("button", { name: /salvar lista/i }));

    expect(await screen.findByText(/orçamento deve ser maior que zero/i)).toBeInTheDocument();
    expect(await repo.listarListas()).toHaveLength(0);
  });
});

describe("CA-R6 / CA-R12: itens e totais no detalhe", () => {
  it("adiciona item e mostra parcial, total estimado e saldo", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    renderizar(`/listas/${lista.id}`, repo);

    await user.type(await screen.findByLabelText(/^item$/i), "Arroz 5kg");
    await user.type(screen.getByLabelText(/quantidade/i), "2");
    await user.type(screen.getByLabelText(/preço unitário/i), "12,50");
    await user.click(screen.getByRole("button", { name: /^adicionar$/i }));

    expect(await screen.findByText("Arroz 5kg")).toBeInTheDocument();
    expect(screen.getByTestId("total-estimado")).toHaveTextContent("R$ 25,00");
    expect(screen.getByTestId("saldo")).toHaveTextContent("R$ 375,00");
  });

  it("soma item fracionado: 0,750 kg a R$ 39,90 dá R$ 29,93", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    renderizar(`/listas/${lista.id}`, repo);

    await user.type(await screen.findByLabelText(/^item$/i), "Picanha");
    await user.type(screen.getByLabelText(/quantidade/i), "0,750");
    await user.type(screen.getByLabelText(/preço unitário/i), "39,90");
    await user.click(screen.getByRole("button", { name: /^adicionar$/i }));

    expect(await screen.findByText("Picanha")).toBeInTheDocument();
    expect(screen.getByTestId("total-estimado")).toHaveTextContent("R$ 29,93");
  });
});

describe("CA-R40: lista concluída é somente leitura", () => {
  it("esconde o formulário de item e avisa que a lista está concluída", async () => {
    const { repo } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });
    await repo.concluirLista(lista.id);
    renderizar(`/listas/${lista.id}`, repo);

    expect(await screen.findByText(/lista concluída/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^item$/i)).not.toBeInTheDocument();
  });
});

describe("CA-R8: cards das listas", () => {
  it("mostra nome e valor de cada lista, da mais nova para a mais antiga", async () => {
    const { repo } = await novoAmbiente();
    const recente = await repo.criarLista({ ...listaBase, nome: "Recente", data: "2026-11-20" });
    await repo.adicionarItem(recente.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });
    await repo.criarLista({ ...listaBase, nome: "Antiga", data: "2026-10-01" });
    renderizar("/listas", repo);

    const cards = await screen.findAllByTestId("card-lista");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Recente");
    expect(cards[0]).toHaveTextContent("R$ 25,00");
    expect(cards[1]).toHaveTextContent("Antiga");
  });
});
