import type { Centavos } from "../dominio/dinheiro";
import type { FormaPagamento, TipoCompra } from "../dominio/lista";
import { normalizarNome, validarItem, type DadosNovoItem } from "../dominio/item";
import {
  totalEstimadoCentavos,
  validarLista,
  valorFinalCentavos,
  type DadosNovaLista,
  type ItemDaLista,
} from "../dominio/lista";
import { aplicarItemAoCatalogo, sugerirProdutos, type Produto } from "../dominio/produto";
import type { BancoListo, ItemRegistro, ListaRegistro, ProdutoRegistro } from "./db";

export interface SugestaoProduto {
  nome: string;
  precoSugeridoCentavos: Centavos;
}

/** Campos editáveis de um item — camelCase no limite do repositório. */
export interface PatchLista {
  nome?: string;
  data?: string;
  tipo?: TipoCompra;
  orcamentoCentavos?: Centavos;
  mercado?: string;
  formaPagamento?: FormaPagamento;
}

export interface OpcoesNovoItem {
  /** R25: item criado dentro do modo compra já nasce adquirido. */
  adquirido?: boolean;
}

export interface ResultadoImportacao {
  importados: number;
}

export interface PatchItem {
  nome?: string;
  quantidadeMilesimos?: number;
  precoUnitarioCentavos?: Centavos;
}

export interface Repositorio {
  criarLista(dados: DadosNovaLista): Promise<ListaRegistro>;
  listarListas(): Promise<ListaRegistro[]>;
  listarListasComTotais(): Promise<Array<ListaRegistro & { totalEstimadoCentavos: Centavos }>>;
  editarLista(id: string, patch: PatchLista): Promise<ListaRegistro>;
  iniciarCompra(id: string): Promise<ListaRegistro>;
  exportarBackup(): Promise<string>;
  importarBackup(json: string): Promise<ResultadoImportacao>;
  obterLista(id: string): Promise<ListaRegistro | undefined>;
  excluirLista(id: string): Promise<void>;

  adicionarItem(listaId: string, dados: DadosNovoItem, opcoes?: OpcoesNovoItem): Promise<ItemRegistro>;
  editarItem(id: string, patch: PatchItem): Promise<ItemRegistro>;
  removerItem(id: string): Promise<void>;
  restaurarItem(item: ItemRegistro): Promise<void>;
  listarItens(listaId: string): Promise<ItemRegistro[]>;
  listarAdquiridos(listaId: string): Promise<ItemRegistro[]>;
  marcarAdquirido(id: string, adquirido: boolean): Promise<void>;

  concluirLista(id: string, opcoes?: { dataConclusao?: string }): Promise<ListaRegistro>;
  totalDoMes(mes: string): Promise<Centavos>;
  ultimasConcluidas(limite?: number): Promise<ListaRegistro[]>;

  listarProdutos(): Promise<ProdutoRegistro[]>;
  sugerirProdutos(texto: string): Promise<SugestaoProduto[]>;
}

const agora = (): string => new Date().toISOString();

function hojeLocal(): string {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

function novoId(): string {
  const cripto = globalThis.crypto as Crypto | undefined;
  if (cripto?.randomUUID) return cripto.randomUUID();
  return `x_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function paraProduto(registro: ProdutoRegistro): Produto {
  return {
    id: registro.id,
    nome: registro.nome,
    nomeNormalizado: registro.nome_normalizado,
    precoPadraoCentavos: registro.preco_padrao_centavos,
    ultimoPrecoCentavos: registro.ultimo_preco_centavos,
  };
}

function paraItemDaLista(registro: ItemRegistro): ItemDaLista {
  return {
    nome: registro.nome,
    quantidadeMilesimos: registro.quantidade_milesimos,
    precoUnitarioCentavos: registro.preco_unitario_centavos,
    adquirido: registro.adquirido,
  };
}

function exigirEditavel(lista: ListaRegistro | undefined): ListaRegistro {
  if (!lista) throw new Error("lista não encontrada");
  if (lista.status === "concluida") {
    throw new Error("lista concluída: itens são somente leitura (R40)");
  }
  return lista;
}

/** M-01: repositório sobre Dexie. Toda regra de negócio vem de `src/dominio`. */
export function criarRepositorio(db: BancoListo): Repositorio {
  async function alimentarCatalogo(nome: string, precoCentavos: Centavos): Promise<string | null> {
    const registros = await db.produtos.toArray();
    const mapa = new Map(registros.map((registro) => [registro.nome_normalizado, registro]));
    const catalogo = aplicarItemAoCatalogo(registros.map(paraProduto), {
      nome,
      precoUnitarioCentavos: precoCentavos,
    });

    for (const produto of catalogo) {
      const antigo = mapa.get(produto.nomeNormalizado);
      if (antigo && antigo.ultimo_preco_centavos === produto.ultimoPrecoCentavos) continue;
      await db.produtos.put({
        id: produto.id,
        nome: produto.nome,
        nome_normalizado: produto.nomeNormalizado,
        preco_padrao_centavos: produto.precoPadraoCentavos,
        ultimo_preco_centavos: produto.ultimoPrecoCentavos,
        criado_em: antigo?.criado_em ?? agora(),
        atualizado_em: agora(),
      });
    }

    const chave = normalizarNome(nome);
    return catalogo.find((produto) => produto.nomeNormalizado === chave)?.id ?? null;
  }

  async function proximaOrdem(listaId: string): Promise<number> {
    const itens = await db.itens.where("lista_id").equals(listaId).sortBy("ordem");
    const ultimo = itens[itens.length - 1];
    return ultimo ? ultimo.ordem + 1 : 0;
  }

  return {
    async criarLista(dados) {
      const validacao = validarLista(dados);
      if (!validacao.ok) throw new Error(`lista inválida: ${validacao.erros.join("; ")}`);

      const registro: ListaRegistro = {
        id: novoId(),
        nome: dados.nome.trim(),
        data: dados.data,
        tipo: dados.tipo,
        orcamento_centavos: dados.orcamentoCentavos,
        mercado: dados.mercado?.trim() || undefined,
        forma_pagamento: dados.formaPagamento,
        status: "planejamento",
        valor_final_centavos: null,
        data_conclusao: null,
        criado_em: agora(),
        atualizado_em: agora(),
      };
      await db.listas.add(registro);
      return registro;
    },

    async listarListas() {
      return db.listas.orderBy("data").reverse().toArray();
    },

    async listarListasComTotais() {
      const listas = await db.listas.orderBy("data").reverse().toArray();
      const comTotais = [];
      for (const lista of listas) {
        const itens = await db.itens.where("lista_id").equals(lista.id).sortBy("ordem");
        comTotais.push({
          ...lista,
          totalEstimadoCentavos: totalEstimadoCentavos(itens.map(paraItemDaLista)),
        });
      }
      return comTotais;
    },

    async editarLista(id, patch) {
      const lista = await db.listas.get(id);
      if (!lista) throw new Error("lista não encontrada");

      const mesclada: DadosNovaLista = {
        nome: patch.nome ?? lista.nome,
        data: patch.data ?? lista.data,
        tipo: patch.tipo ?? lista.tipo,
        orcamentoCentavos: patch.orcamentoCentavos ?? lista.orcamento_centavos,
        mercado: patch.mercado ?? lista.mercado,
        formaPagamento: patch.formaPagamento ?? lista.forma_pagamento,
      };

      const validacao = validarLista(mesclada);
      if (!validacao.ok) throw new Error(`lista inválida: ${validacao.erros.join("; ")}`);

      const atualizada: ListaRegistro = {
        ...lista,
        nome: mesclada.nome.trim(),
        data: mesclada.data,
        tipo: mesclada.tipo,
        orcamento_centavos: mesclada.orcamentoCentavos,
        mercado: mesclada.mercado?.trim() || undefined,
        forma_pagamento: mesclada.formaPagamento,
        atualizado_em: agora(),
      };
      await db.listas.put(atualizada);
      return atualizada;
    },

    async iniciarCompra(id) {
      const lista = await db.listas.get(id);
      if (!lista) throw new Error("lista não encontrada");
      if (lista.status === "concluida") throw new Error("lista concluída: não é possível comprar de novo (R40)");
      if (lista.status === "comprando") return lista;

      const emCompra: ListaRegistro = { ...lista, status: "comprando", atualizado_em: agora() };
      await db.listas.put(emCompra);
      return emCompra;
    },

    async exportarBackup() {
      const [listas, itens, produtos] = await Promise.all([
        db.listas.toArray(),
        db.itens.toArray(),
        db.produtos.toArray(),
      ]);
      return JSON.stringify({ versao: 1, exportadoEm: agora(), listas, itens, produtos }, null, 2);
    },

    async importarBackup(json) {
      let bruto: unknown;
      try {
        bruto = JSON.parse(json);
      } catch {
        throw new Error("backup inválido: JSON malformado");
      }

      const backup = bruto as {
        versao?: number;
        listas?: ListaRegistro[];
        itens?: ItemRegistro[];
        produtos?: ProdutoRegistro[];
      };

      if (
        !backup ||
        backup.versao !== 1 ||
        !Array.isArray(backup.listas) ||
        !Array.isArray(backup.itens) ||
        !Array.isArray(backup.produtos)
      ) {
        throw new Error("backup inválido: formato inesperado");
      }

      await db.transaction("rw", db.listas, db.itens, db.produtos, async () => {
        const mapaListas = new Map<string, string>();

        for (const lista of backup.listas ?? []) {
          const idNovo = novoId();
          mapaListas.set(lista.id, idNovo);
          await db.listas.put({ ...lista, id: idNovo, criado_em: agora(), atualizado_em: agora() });
        }

        for (const item of backup.itens ?? []) {
          const listaId = mapaListas.get(item.lista_id);
          if (!listaId) continue;
          await db.itens.put({
            ...item,
            id: novoId(),
            lista_id: listaId,
            produto_id: null,
            criado_em: agora(),
            atualizado_em: agora(),
          });
        }

        for (const produto of backup.produtos ?? []) {
          const existente = await db.produtos
            .where("nome_normalizado")
            .equals(produto.nome_normalizado)
            .first();
          if (existente) continue;
          await db.produtos.put({ ...produto, id: novoId(), criado_em: agora(), atualizado_em: agora() });
        }
      });

      return { importados: (backup.listas ?? []).length };
    },

    async obterLista(id) {
      return db.listas.get(id);
    },

    async excluirLista(id) {
      await db.transaction("rw", db.listas, db.itens, async () => {
        await db.itens.where("lista_id").equals(id).delete();
        await db.listas.delete(id);
      });
    },

    async adicionarItem(listaId, dados, opcoes) {
      exigirEditavel(await db.listas.get(listaId));
      const validacao = validarItem(dados);
      if (!validacao.ok) throw new Error(`item inválido: ${validacao.erros.join("; ")}`);

      return db.transaction("rw", db.listas, db.itens, db.produtos, async () => {
        const produtoId = await alimentarCatalogo(dados.nome, dados.precoUnitarioCentavos);
        const registro: ItemRegistro = {
          id: novoId(),
          lista_id: listaId,
          produto_id: produtoId,
          nome: dados.nome.trim(),
          quantidade_milesimos: dados.quantidadeMilesimos,
          preco_unitario_centavos: dados.precoUnitarioCentavos,
          adquirido: opcoes?.adquirido ?? false,
          ordem: await proximaOrdem(listaId),
          criado_em: agora(),
          atualizado_em: agora(),
        };
        await db.itens.add(registro);
        await db.listas.update(listaId, { atualizado_em: agora() });
        return registro;
      });
    },

    async editarItem(id, patch) {
      const item = await db.itens.get(id);
      if (!item) throw new Error("item não encontrado");
      exigirEditavel(await db.listas.get(item.lista_id));

      const nome = patch.nome ?? item.nome;
      const quantidadeMilesimos = patch.quantidadeMilesimos ?? item.quantidade_milesimos;
      const precoUnitarioCentavos = patch.precoUnitarioCentavos ?? item.preco_unitario_centavos;

      const validacao = validarItem({ nome, quantidadeMilesimos, precoUnitarioCentavos });
      if (!validacao.ok) throw new Error(`item inválido: ${validacao.erros.join("; ")}`);

      const atualizado: ItemRegistro = {
        ...item,
        nome: nome.trim(),
        quantidade_milesimos: quantidadeMilesimos,
        preco_unitario_centavos: precoUnitarioCentavos,
        atualizado_em: agora(),
      };

      await db.transaction("rw", db.listas, db.itens, db.produtos, async () => {
        await alimentarCatalogo(atualizado.nome, atualizado.preco_unitario_centavos);
        await db.itens.put(atualizado);
        await db.listas.update(item.lista_id, { atualizado_em: agora() });
      });
      return atualizado;
    },

    async removerItem(id) {
      const item = await db.itens.get(id);
      if (!item) throw new Error("item não encontrado");
      exigirEditavel(await db.listas.get(item.lista_id));

      await db.transaction("rw", db.listas, db.itens, async () => {
        await db.itens.delete(id);
        await db.listas.update(item.lista_id, { atualizado_em: agora() });
      });
    },

    async restaurarItem(item) {
      await db.itens.put(item);
      await db.listas.update(item.lista_id, { atualizado_em: agora() });
    },

    async listarItens(listaId) {
      return db.itens.where("lista_id").equals(listaId).sortBy("ordem");
    },

    async listarAdquiridos(listaId) {
      const itens = await db.itens.where("lista_id").equals(listaId).sortBy("ordem");
      return itens.filter((item) => item.adquirido);
    },

    async marcarAdquirido(id, adquirido) {
      const item = await db.itens.get(id);
      if (!item) throw new Error("item não encontrado");
      exigirEditavel(await db.listas.get(item.lista_id));
      await db.itens.update(id, { adquirido, atualizado_em: agora() });
    },

    async concluirLista(id, opcoes) {
      const lista = await db.listas.get(id);
      if (!lista) throw new Error("lista não encontrada");

      const itens = await db.itens.where("lista_id").equals(id).sortBy("ordem");
      const valorFinal = valorFinalCentavos(itens.map(paraItemDaLista));

      const atualizada: ListaRegistro = {
        ...lista,
        status: "concluida",
        valor_final_centavos: valorFinal,
        data_conclusao: opcoes?.dataConclusao ?? hojeLocal(),
        atualizado_em: agora(),
      };
      await db.listas.put(atualizada);
      return atualizada;
    },

    async totalDoMes(mes) {
      const concluidas = await db.listas.where("status").equals("concluida").toArray();
      return concluidas
        .filter((lista) => (lista.data_conclusao ?? "").slice(0, 7) === mes)
        .reduce((total, lista) => total + (lista.valor_final_centavos ?? 0), 0);
    },

    async ultimasConcluidas(limite = 5) {
      const concluidas = await db.listas.where("status").equals("concluida").toArray();
      return concluidas
        .filter((lista) => Boolean(lista.data_conclusao))
        .sort((a, b) => (b.data_conclusao ?? "").localeCompare(a.data_conclusao ?? ""))
        .slice(0, limite);
    },

    async listarProdutos() {
      return db.produtos.toArray();
    },

    async sugerirProdutos(texto) {
      const catalogo = (await db.produtos.toArray()).map(paraProduto);
      return sugerirProdutos(catalogo, texto);
    },
  };
}