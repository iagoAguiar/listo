import type { Centavos, Milesimos } from "./dinheiro";
import { parcialCentavos } from "./dinheiro";

export type TipoCompra = "mensal" | "semanal" | "esporadica";
export type FormaPagamento = "dinheiro" | "pix" | "credito" | "debito" | "vale";
export type StatusLista = "planejamento" | "comprando" | "concluida";

export interface DadosNovaLista {
  nome: string;
  data: string;
  tipo: TipoCompra;
  orcamentoCentavos: Centavos;
  mercado?: string;
  formaPagamento: FormaPagamento;
}

export interface ItemDaLista {
  nome: string;
  quantidadeMilesimos: Milesimos;
  precoUnitarioCentavos: Centavos;
  adquirido: boolean;
}

export interface ResultadoValidacao {
  ok: boolean;
  erros: string[];
}

export const TIPOS_COMPRA: readonly TipoCompra[] = ["mensal", "semanal", "esporadica"];
export const FORMAS_PAGAMENTO: readonly FormaPagamento[] = [
  "dinheiro",
  "pix",
  "credito",
  "debito",
  "vale",
];

/** R4 + R42: nome de 1 a 60 caracteres e orçamento inteiro maior que zero. */
export function validarLista(dados: DadosNovaLista): ResultadoValidacao {
  const erros: string[] = [];
  const nome = (dados.nome ?? "").trim();

  if (!nome) erros.push("nome é obrigatório");
  else if (nome.length > 60) erros.push("nome deve ter no máximo 60 caracteres");

  if (!Number.isInteger(dados.orcamentoCentavos) || dados.orcamentoCentavos <= 0) {
    erros.push("orçamento deve ser maior que zero");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data ?? "")) erros.push("data inválida");
  if (!TIPOS_COMPRA.includes(dados.tipo)) erros.push("tipo de compra inválido");
  if (!FORMAS_PAGAMENTO.includes(dados.formaPagamento)) {
    erros.push("forma de pagamento inválida");
  }

  return { ok: erros.length === 0, erros };
}

/** R16: soma dos parciais de todos os itens (marcados ou não). */
export function totalEstimadoCentavos(itens: ItemDaLista[]): Centavos {
  return itens.reduce(
    (total, item) => total + parcialCentavos(item.quantidadeMilesimos, item.precoUnitarioCentavos),
    0,
  );
}

/** R17: orçamento - total. Positivo = abaixo do orçamento, negativo = acima. */
export function saldoCentavos(orcamentoCentavos: Centavos, totalCentavos: Centavos): Centavos {
  return orcamentoCentavos - totalCentavos;
}

/** R18: soma dos parciais apenas dos itens marcados. Informativo (D-005). */
export function totalCarrinhoCentavos(itens: ItemDaLista[]): Centavos {
  return itens
    .filter((item) => item.adquirido)
    .reduce(
      (total, item) => total + parcialCentavos(item.quantidadeMilesimos, item.precoUnitarioCentavos),
      0,
    );
}

/**
 * D-005 + R28: o valor gravado ao concluir soma TODOS os itens da lista.
 * Item só deixa de contar se for excluído.
 */
export function valorFinalCentavos(itens: ItemDaLista[]): Centavos {
  return totalEstimadoCentavos(itens);
}