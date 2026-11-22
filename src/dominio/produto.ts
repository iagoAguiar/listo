import type { Centavos } from "./dinheiro";

export interface Produto {
  id: string;
  nome: string;
  nomeNormalizado: string;
  precoPadraoCentavos: Centavos;
  ultimoPrecoCentavos: Centavos;
}

export interface ItemParaCatalogo {
  nome: string;
  precoUnitarioCentavos: Centavos;
}

/**
 * R14: todo item gravado alimenta o catálogo. Cria o produto quando o nome
 * normalizado não existe e atualiza o último preço quando existe, sem duplicar.
 */
export function aplicarItemAoCatalogo(
  _catalogo: Produto[],
  _item: ItemParaCatalogo,
): Produto[] {
  throw new Error("não implementado: aplicarItemAoCatalogo (R14)");
}

/** R10/R11: até 5 sugestões do catálogo por nome normalizado, com o preço a sugerir. */
export function sugerirProdutos(
  _catalogo: Produto[],
  _textoDigitado: string,
): Array<{ nome: string; precoSugeridoCentavos: Centavos }> {
  throw new Error("não implementado: sugerirProdutos (R10, R11)");
}