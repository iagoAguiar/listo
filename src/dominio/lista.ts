import type { Centavos, Milesimos } from "./dinheiro";

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

export function validarLista(_dados: DadosNovaLista): ResultadoValidacao {
  throw new Error("não implementado: validarLista (R4, R42)");
}

export function totalEstimadoCentavos(_itens: ItemDaLista[]): Centavos {
  throw new Error("não implementado: totalEstimadoCentavos (R16)");
}

export function saldoCentavos(
  _orcamentoCentavos: Centavos,
  _totalCentavos: Centavos,
): Centavos {
  throw new Error("não implementado: saldoCentavos (R17)");
}

export function totalCarrinhoCentavos(_itens: ItemDaLista[]): Centavos {
  throw new Error("não implementado: totalCarrinhoCentavos (R18)");
}

export function valorFinalCentavos(_itens: ItemDaLista[]): Centavos {
  throw new Error("não implementado: valorFinalCentavos (D-005)");
}