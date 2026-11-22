import type { Centavos, Milesimos } from "./dinheiro";
import type { ResultadoValidacao } from "./lista";

export interface DadosNovoItem {
  nome: string;
  quantidadeMilesimos: Milesimos;
  precoUnitarioCentavos: Centavos;
}

/** caixa baixa, sem acento, espaços colapsados — chave de match do catálogo (R14) */
export function normalizarNome(_nome: string): string {
  throw new Error("não implementado: normalizarNome (R10, R14)");
}

export function validarItem(_dados: DadosNovoItem): ResultadoValidacao {
  throw new Error("não implementado: validarItem (R9)");
}