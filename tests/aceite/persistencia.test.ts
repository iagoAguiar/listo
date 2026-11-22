import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { criarBanco, type BancoListo } from "../../src/dados/db";
import { criarRepositorio, type Repositorio } from "../../src/dados/repositorio";
import { paraMilesimos } from "../../src/dominio/dinheiro";

let contador = 0;

interface Cenario {
  nome: string;
  db: BancoListo;
  repo: Repositorio;
}

async function cenario(): Promise<Cenario> {
  const nome = `listo-teste-${contador++}`;
  const db = criarBanco(nome);
  await db.open();
  return { nome, db, repo: criarRepositorio(db) };
}

const listaBase = {
  nome: "Compras do mês",
  data: "2026-11-22",
  tipo: "mensal" as const,
  orcamentoCentavos: 40000,
  formaPagamento: "pix" as const,
};

const itemBase = {
  nome: "Arroz 5kg",
  quantidadeMilesimos: paraMilesimos("1"),
  precoUnitarioCentavos: 2500,
};

describe("CA-R1: persistência em IndexedDB", () => {
  it("grava lista e item e devolve tudo depois de fechar e reabrir o banco", async () => {
    const { nome, db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, itemBase);

    db.close();
    const reaberto = criarBanco(nome);
    await reaberto.open();
    const repo2 = criarRepositorio(reaberto);

    const listas = await repo2.listarListas();
    expect(listas).toHaveLength(1);
    expect(listas[0]?.nome).toBe("Compras do mês");

    const itens = await repo2.listarItens(lista.id);
    expect(itens).toHaveLength(1);
    expect(itens[0]?.preco_unitario_centavos).toBe(2500);
    expect(itens[0]?.quantidade_milesimos).toBe(1000);
    reaberto.close();
  });

  it("banco v1 tem as três tabelas da spec", async () => {
    const { db } = await cenario();
    const tabelas = db.tables.map((t) => t.name).sort();
    expect(tabelas).toEqual(["itens", "listas", "produtos"]);
    db.close();
  });
});

describe("R4 / R42: criação de lista pelo repositório", () => {
  it("recusa orçamento zero sem gravar nada", async () => {
    const { db, repo } = await cenario();
    await expect(repo.criarLista({ ...listaBase, orcamentoCentavos: 0 })).rejects.toThrow(/orçamento/);
    expect(await repo.listarListas()).toHaveLength(0);
    db.close();
  });

  it("R41: aceita duas listas com o mesmo nome", async () => {
    const { db, repo } = await cenario();
    await repo.criarLista(listaBase);
    await repo.criarLista({ ...listaBase, data: "2026-11-23" });
    expect(await repo.listarListas()).toHaveLength(2);
    db.close();
  });
});

describe("CA-R8: ordenação das listas", () => {
  it("devolve as listas por data decrescente", async () => {
    const { db, repo } = await cenario();
    await repo.criarLista({ ...listaBase, nome: "antiga", data: "2026-10-01" });
    await repo.criarLista({ ...listaBase, nome: "recente", data: "2026-11-20" });
    await repo.criarLista({ ...listaBase, nome: "meio", data: "2026-11-01" });

    const nomes = (await repo.listarListas()).map((lista) => lista.nome);
    expect(nomes).toEqual(["recente", "meio", "antiga"]);
    db.close();
  });
});

describe("R7: excluir lista apaga os itens junto", () => {
  it("não deixa item órfão depois de excluir a lista", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, itemBase);
    await repo.adicionarItem(lista.id, { ...itemBase, nome: "Feijão" });

    await repo.excluirLista(lista.id);

    expect(await repo.listarListas()).toHaveLength(0);
    expect(await repo.listarItens(lista.id)).toHaveLength(0);
    db.close();
  });
});

describe("R9 / R40: item em lista concluída é somente leitura", () => {
  it("concluir grava valor final e data de conclusão (R28)", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, { nome: "Arroz", quantidadeMilesimos: 2000, precoUnitarioCentavos: 1000 });

    const concluida = await repo.concluirLista(lista.id);

    expect(concluida.status).toBe("concluida");
    expect(concluida.valor_final_centavos).toBe(2000);
    expect(concluida.data_conclusao).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    db.close();
  });

  it("bloqueia adicionar, editar e remover item depois de concluída", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    const item = await repo.adicionarItem(lista.id, itemBase);
    await repo.concluirLista(lista.id);

    await expect(repo.adicionarItem(lista.id, { ...itemBase, nome: "Café" })).rejects.toThrow(/concluída/);
    await expect(repo.editarItem(item.id, { precoUnitarioCentavos: 9999 })).rejects.toThrow(/concluída/);
    await expect(repo.removerItem(item.id)).rejects.toThrow(/concluída/);
    db.close();
  });
});

describe("R13: desfazer remoção de item", () => {
  it("restaura o item removido com o mesmo id e a mesma ordem", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    const item = await repo.adicionarItem(lista.id, itemBase);

    await repo.removerItem(item.id);
    expect(await repo.listarItens(lista.id)).toHaveLength(0);

    await repo.restaurarItem(item);
    const itens = await repo.listarItens(lista.id);
    expect(itens).toHaveLength(1);
    expect(itens[0]?.id).toBe(item.id);
    expect(itens[0]?.ordem).toBe(item.ordem);
    db.close();
  });
});

describe("CA-R14: item alimenta o catálogo", () => {
  it("cria o produto no primeiro item e atualiza o último preço no segundo", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, itemBase);
    await repo.adicionarItem(lista.id, { ...itemBase, nome: "arroz 5KG", precoUnitarioCentavos: 2790 });

    const produtos = await repo.listarProdutos();
    expect(produtos).toHaveLength(1);
    expect(produtos[0]?.nome_normalizado).toBe("arroz 5kg");
    expect(produtos[0]?.ultimo_preco_centavos).toBe(2790);
    db.close();
  });

  it("sugere produto do catálogo para o autocomplete", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    await repo.adicionarItem(lista.id, itemBase);

    const sugestoes = await repo.sugerirProdutos("arr");
    expect(sugestoes).toHaveLength(1);
    expect(sugestoes[0]?.precoSugeridoCentavos).toBe(2500);
    db.close();
  });
});

describe("R31 / R32: início", () => {
  it("soma o valor final das listas concluídas no mês", async () => {
    const { db, repo } = await cenario();
    const novembro = await repo.criarLista({ ...listaBase, data: "2026-11-05" });
    await repo.adicionarItem(novembro.id, { nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: 1000 });
    await repo.concluirLista(novembro.id, { dataConclusao: "2026-11-05" });

    const outubro = await repo.criarLista({ ...listaBase, nome: "Outubro", data: "2026-10-05" });
    await repo.adicionarItem(outubro.id, { nome: "Feijão", quantidadeMilesimos: 1000, precoUnitarioCentavos: 5000 });
    await repo.concluirLista(outubro.id, { dataConclusao: "2026-10-05" });

    expect(await repo.totalDoMes("2026-11")).toBe(1000);
    db.close();
  });

  it("lista as 5 compras concluídas mais recentes, da mais nova para a mais antiga", async () => {
    const { db, repo } = await cenario();
    for (const dia of ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06"]) {
      const lista = await repo.criarLista({ ...listaBase, nome: `Compra ${dia}`, data: dia });
      await repo.concluirLista(lista.id, { dataConclusao: dia });
    }
    const ultimas = await repo.ultimasConcluidas(5);
    expect(ultimas).toHaveLength(5);
    expect(ultimas[0]?.data_conclusao).toBe("2026-10-06");
    expect(ultimas[4]?.data_conclusao).toBe("2026-10-02");
    db.close();
  });
});

describe("R25 / R26: modo compra", () => {
  it("marca e desmarca item como adquirido e devolve só os marcados", async () => {
    const { db, repo } = await cenario();
    const lista = await repo.criarLista(listaBase);
    const arroz = await repo.adicionarItem(lista.id, itemBase);
    await repo.adicionarItem(lista.id, { ...itemBase, nome: "Feijão" });

    await repo.marcarAdquirido(arroz.id, true);
    expect((await repo.listarAdquiridos(lista.id)).map((i) => i.nome)).toEqual(["Arroz 5kg"]);

    await repo.marcarAdquirido(arroz.id, false);
    expect(await repo.listarAdquiridos(lista.id)).toHaveLength(0);
    db.close();
  });
});