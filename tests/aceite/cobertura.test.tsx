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
  const db = criarBanco(`cobertura-${contador++}`);
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

describe("CA-R5: lista nasce em planejamento e abre no detalhe", () => {
  it("salva com status planejamento e cai na tela de detalhe da lista criada", async () => {
    const { repo, user } = await novoAmbiente();
    renderizar("/listas/nova", repo);

    const nome = await screen.findByLabelText(/nome da lista/i);
    await user.type(nome, "Feira da semana");
    const data = screen.getByLabelText(/data/i);
    await user.clear(data);
    await user.type(data, "2026-11-25");
    const orcamento = screen.getByLabelText(/orçamento/i);
    await user.type(orcamento, "25000");
    await user.click(screen.getByRole("button", { name: /salvar lista/i }));

    const lista = await waitFor(async () => {
      const [registro] = await repo.listarListas();
      expect(registro).toBeDefined();
      return registro!;
    });

    expect(lista.status).toBe("planejamento");
    expect(lista.nome).toBe("Feira da semana");
    expect(await screen.findByRole("heading", { name: "Feira da semana" })).toBeInTheDocument();
    expect(screen.getByTestId("orcamento")).toHaveTextContent("R$ 250,00");
  });
});

describe("CA-R19: total recalculado no mesmo ciclo da ação", () => {
  it("atualiza o total na tela logo após adicionar o item, sem recarregar", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    renderizar(`/listas/${lista.id}`, repo);

    await user.type(await screen.findByLabelText(/^item$/i), "Arroz");
    await user.type(screen.getByLabelText(/^quantidade$/i), "2");
    await user.type(screen.getByLabelText(/preço unitário/i), "1250");
    await user.click(screen.getByRole("button", { name: /^adicionar$/i }));

    await waitFor(() => expect(screen.getByTestId("total-estimado")).toHaveTextContent("R$ 25,00"));
    expect(screen.getByTestId("saldo")).toHaveTextContent("R$ 375,00");
  });
});

describe("CA-R29: voltar do resumo sem confirmar", () => {
  it("mantém o status comprando e os itens marcados como estavam", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    const arroz = await repo.adicionarItem(lista.id, {
      nome: "Arroz",
      quantidadeMilesimos: 1000,
      precoUnitarioCentavos: 2500,
    });
    await repo.adicionarItem(lista.id, { nome: "Café", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1999 });
    await repo.iniciarCompra(lista.id);
    await repo.marcarAdquirido(arroz.id, true);

    renderizar(`/listas/${lista.id}/finalizar`, repo);
    await user.click(await screen.findByRole("link", { name: /voltar/i }));

    await waitFor(async () => expect((await repo.obterLista(lista.id))?.status).toBe("comprando"));
    expect(await repo.listarAdquiridos(lista.id)).toHaveLength(1);
    expect(screen.getByTestId("valor-final")).toHaveTextContent("R$ 44,99");
  });
});