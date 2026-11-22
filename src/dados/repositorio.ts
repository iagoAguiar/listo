import type { Centavos } from "../dominio/dinheiro";
import type { DadosNovoItem } from "../dominio/item";
import type { DadosNovaLista } from "../dominio/lista";
import type { BancoListo, ItemRegistro, ListaRegistro, ProdutoRegistro } from "./db";

export interface SugestaoProduto {
  nome: string;
  precoSugeridoCentavos: Centavos;
}

export interface Repositorio {
  criarLista(dados: DadosNovaLista): Promise<ListaRegistro>;
  listarListas(): Promise<ListaRegistro[]>;
  obterLista(id: string): Promise<ListaRegistro | undefined>;
  excluirLista(id: string): Promise<void>;

  adicionarItem(listaId: string, dados: DadosNovoItem): Promise<ItemRegistro>;
  editarItem(
    id: string,
    patch: Partial<Pick<ItemRegistro, "nome" | "quantidade_milesimos" | "preco_unitario_centavos">>,
  ): Promise<ItemRegistro>;
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

export function criarRepositorio(_db: BancoListo): Repositorio {
  throw new Error("não implementado: criarRepositorio (M-01)");
}