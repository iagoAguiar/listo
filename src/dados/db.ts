import Dexie, { type Table } from "dexie";
import type { FormaPagamento, StatusLista, TipoCompra } from "../dominio/lista";
import type { Centavos } from "../dominio/dinheiro";

/** Registro da tabela `listas` — nomes de campo em snake_case conforme a spec. */
export interface ListaRegistro {
  id: string;
  nome: string;
  data: string;
  tipo: TipoCompra;
  orcamento_centavos: Centavos;
  mercado?: string;
  forma_pagamento: FormaPagamento;
  status: StatusLista;
  valor_final_centavos: Centavos | null;
  data_conclusao: string | null;
  criado_em: string;
  atualizado_em: string;
}

/** Registro da tabela `itens`. */
export interface ItemRegistro {
  id: string;
  lista_id: string;
  produto_id: string | null;
  nome: string;
  quantidade_milesimos: number;
  preco_unitario_centavos: Centavos;
  adquirido: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
}

/** Registro da tabela `produtos` — catálogo com `nome_normalizado` único. */
export interface ProdutoRegistro {
  id: string;
  nome: string;
  nome_normalizado: string;
  preco_padrao_centavos: Centavos;
  ultimo_preco_centavos: Centavos;
  criado_em: string;
  atualizado_em: string;
}

export class BancoListo extends Dexie {
  declare listas: Table<ListaRegistro, string>;
  declare itens: Table<ItemRegistro, string>;
  declare produtos: Table<ProdutoRegistro, string>;
}

/** R1: banco `listo` v1 com as três tabelas e os índices da spec. */
export function criarBanco(nome = "listo"): BancoListo {
  const db = new BancoListo(nome);
  db.version(1).stores({
    listas: "id, data, status, data_conclusao",
    itens: "id, lista_id, [lista_id+ordem]",
    produtos: "id, &nome_normalizado",
  });
  return db;
}