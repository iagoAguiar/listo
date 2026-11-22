import type { Centavos } from "./dinheiro";
import { normalizarNome } from "./item";

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

const MAX_SUGESTOES = 5;

function novoId(): string {
  const cripto = globalThis.crypto as Crypto | undefined;
  if (cripto?.randomUUID) return cripto.randomUUID();
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * R14: todo item gravado alimenta o catálogo. Cria o produto quando o nome
 * normalizado não existe e atualiza o último preço quando existe, sem duplicar.
 * Devolve catálogo novo — não muta o array recebido.
 */
export function aplicarItemAoCatalogo(
  catalogo: Produto[],
  item: ItemParaCatalogo,
): Produto[] {
  const nomeNormalizado = normalizarNome(item.nome);
  if (!nomeNormalizado) throw new Error("entrada inválida: nome do item vazio");

  const indice = catalogo.findIndex((produto) => produto.nomeNormalizado === nomeNormalizado);
  if (indice === -1) {
    const novo: Produto = {
      id: novoId(),
      nome: item.nome.trim(),
      nomeNormalizado,
      precoPadraoCentavos: item.precoUnitarioCentavos,
      ultimoPrecoCentavos: item.precoUnitarioCentavos,
    };
    return [...catalogo, novo];
  }

  const atual = catalogo[indice];
  if (!atual) return catalogo;

  const resultado = [...catalogo];
  resultado[indice] = { ...atual, ultimoPrecoCentavos: item.precoUnitarioCentavos };
  return resultado;
}

/** R10/R11: até 5 sugestões por trecho do nome normalizado, com o último preço. */
export function sugerirProdutos(
  catalogo: Produto[],
  textoDigitado: string,
): Array<{ nome: string; precoSugeridoCentavos: Centavos }> {
  const trecho = normalizarNome(textoDigitado);
  if (!trecho) return [];

  return catalogo
    .filter((produto) => produto.nomeNormalizado.includes(trecho))
    .slice(0, MAX_SUGESTOES)
    .map((produto) => ({
      nome: produto.nome,
      precoSugeridoCentavos: produto.ultimoPrecoCentavos || produto.precoPadraoCentavos,
    }));
}