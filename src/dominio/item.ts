import type { Centavos, Milesimos } from "./dinheiro";
import type { ResultadoValidacao } from "./lista";

export interface DadosNovoItem {
  nome: string;
  quantidadeMilesimos: Milesimos;
  precoUnitarioCentavos: Centavos;
}

/** caixa baixa, sem acento, espaços colapsados — chave de match do catálogo (R10, R14) */
export function normalizarNome(nome: string): string {
  return String(nome ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** R9: nome obrigatório, quantidade > 0 e preço >= 0, ambos inteiros. */
export function validarItem(dados: DadosNovoItem): ResultadoValidacao {
  const erros: string[] = [];
  const nome = (dados.nome ?? "").trim();

  if (!nome) erros.push("nome é obrigatório");
  else if (nome.length > 80) erros.push("nome deve ter no máximo 80 caracteres");

  if (!Number.isInteger(dados.quantidadeMilesimos) || dados.quantidadeMilesimos <= 0) {
    erros.push("quantidade deve ser maior que zero");
  }
  if (!Number.isInteger(dados.precoUnitarioCentavos) || dados.precoUnitarioCentavos < 0) {
    erros.push("preço não pode ser negativo");
  }

  return { ok: erros.length === 0, erros };
}