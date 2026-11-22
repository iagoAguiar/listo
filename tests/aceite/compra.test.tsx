import "fake-indexeddb/auto";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { criarBanco } from "../../src/dados/db";
import { criarRepositorio, type Repositorio } from "../../src/dados/repositorio";
import App from "../../src/ui/App";
import { ProvedorRepositorio } from "../../src/ui/Provedor";

let contador = 0;

async function novoAmbiente(): Promise<{ repo: Repositorio; user: ReturnType<typeof userEvent.setup> }> {
  const db = criarBanco(`ui-compra-${contador++}`);
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

async function listaComItens(repo: Repositorio) {
  const lista = await repo.criarLista(listaBase);
  const arroz = await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 2000, precoUnitarioCentavos: 1250 });
  const cafe = await repo.adicionarItem(lista.id, { nome: "Café", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1999 });
  return { lista, arroz, cafe };
}

describe("CA-R25 / CA-R26: modo compra", () => {
  it("marcar item atualiza o total do carrinho e mantém o valor final (D-005)", async () => {
    const { repo, user } = await novoAmbiente();
    const { lista } = await listaComItens(repo);
    renderizar(`/listas/${lista.id}/compra`, repo);

    expect(await screen.findByTestId("valor-final")).toHaveTextContent("R$ 44,99");
    expect(screen.getByTestId("no-carrinho")).toHaveTextContent("R$ 0,00");

    await user.click(screen.getByRole("checkbox", { name: /arroz/i }));

    await waitFor(() => expect(screen.getByTestId("no-carrinho")).toHaveTextContent("R$ 25,00"));
    expect(screen.getByTestId("valor-final")).toHaveTextContent("R$ 44,99");
  });

  it("mostra a quantidade e o preço unitário de cada item", async () => {
    const { repo } = await novoAmbiente();
    const { lista } = await listaComItens(repo);
    renderizar(`/listas/${lista.id}/compra`, repo);

    const linha = await screen.findByTestId("linha-item-arroz");
    expect(within(linha).getByText(/2 × R\$ 12,50/)).toBeInTheDocument();
  });
});

describe("CA-R27 / CA-R28 / R34: finalizar compra", () => {
  it("mostra valor final somando todos os itens e conclui a lista", async () => {
    const { repo, user } = await novoAmbiente();
    const { lista } = await listaComItens(repo);
    renderizar(`/listas/${lista.id}/finalizar`, repo);

    expect(await screen.findByTestId("valor-final")).toHaveTextContent("R$ 44,99");
    expect(screen.getByTestId("contagem")).toHaveTextContent("0 marcados de 2 itens");

    await user.click(screen.getByRole("button", { name: /confirmar compra/i }));

    await waitFor(async () => {
      const concluida = await repo.obterLista(lista.id);
      expect(concluida?.status).toBe("concluida");
      expect(concluida?.valor_final_centavos).toBe(4499);
    });
  });

  it("R45: excluir não marcados remove só os itens não comprados", async () => {
    const { repo, user } = await novoAmbiente();
    const { lista, arroz } = await listaComItens(repo);
    await repo.marcarAdquirido(arroz.id, true);
    renderizar(`/listas/${lista.id}/finalizar`, repo);

    await user.click(await screen.findByRole("button", { name: /excluir não marcados/i }));

    await waitFor(async () => expect(await repo.listarItens(lista.id)).toHaveLength(1));
    expect((await repo.listarItens(lista.id))[0]?.nome).toBe("Arroz");
    await waitFor(() => expect(screen.getByTestId("valor-final")).toHaveTextContent("R$ 25,00"));
  });
});

describe("CA-R13: desfazer remoção de item", () => {
  it("mostra o desfazer depois de remover e devolve o item ao clicar", async () => {
    const { repo, user } = await novoAmbiente();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 });
    renderizar(`/listas/${lista.id}`, repo);

    await user.click(await screen.findByRole("button", { name: /remover arroz/i }));

    expect(await screen.findByText(/item removido/i)).toBeInTheDocument();
    await waitFor(async () => expect(await repo.listarItens(lista.id)).toHaveLength(0));

    await user.click(screen.getByRole("button", { name: /desfazer/i }));

    await waitFor(async () => expect(await repo.listarItens(lista.id)).toHaveLength(1));
    expect((await repo.listarItens(lista.id))[0]?.nome).toBe("Arroz");
  });
});

describe("CA-R31 / CA-R32: início com compras concluídas", () => {
  it("mostra o total do mês corrente e as últimas compras concluídas", async () => {
    const { repo } = await novoAmbiente();
    const { lista } = await listaComItens(repo);
    const mesCorrente = new Date().toLocaleDateString("sv-SE").slice(0, 7);
    await repo.concluirLista(lista.id, { dataConclusao: `${mesCorrente}-10` });
    renderizar("/", repo);

    expect(await screen.findByTestId("total-do-mes")).toHaveTextContent("R$ 44,99");
    const recentes = await screen.findAllByTestId("compra-recente");
    expect(recentes).toHaveLength(1);
    expect(recentes[0]).toHaveTextContent("Compras do mês");
  });
});
