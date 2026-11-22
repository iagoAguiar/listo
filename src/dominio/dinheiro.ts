/**
 * Dinheiro do ListO: sempre inteiro de centavos (D-002).
 * Nenhuma função aqui pode devolver ou receber reais em ponto flutuante.
 *
 * Contrato de erro: entrada inválida lança `Error` com mensagem iniciada por
 * "entrada inválida:" — os testes de aceite (CA-R38, CA-R39) dependem desse prefixo.
 */

/** Contrato: valor inteiro em centavos. R$ 19,99 = 1999. */
export type Centavos = number;

/** Contrato: quantidade inteira em milésimos. 1,5 kg = 1500. */
export type Milesimos = number;

/** R$ 1.000.000,00 — teto do MVP (R38). */
const TETO_CENTAVOS = 100_000_000;

/** 9999,999 — teto de quantidade do MVP (R39). */
const TETO_MILESIMOS = 9_999_999;

function invalido(motivo: string): never {
  throw new Error(`entrada inválida: ${motivo}`);
}

/**
 * Aceita "19,99", "19.99" e "1.999,99". Ponto seguido de exatamente 3 dígitos,
 * repetido, é separador de milhar; vírgula sempre é o decimal.
 */
function normalizarDecimal(texto: string, casas: number): { inteiro: string; fracao: string } {
  const limpo = String(texto ?? "").replace(/\s/g, "");
  if (!limpo) invalido("valor vazio");
  if (limpo.includes("-")) invalido("valor negativo");

  let normal: string;
  if (limpo.includes(",")) {
    normal = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    normal = limpo.replace(/\./g, "");
  } else {
    normal = limpo;
  }

  const padrao = new RegExp(`^\\d+(\\.\\d{1,${casas}})?$`);
  if (!padrao.test(normal)) invalido("formato numérico inválido");

  const partes = normal.split(".");
  return { inteiro: partes[0] ?? "0", fracao: partes[1] ?? "" };
}

/** R38: texto do usuário -> centavos inteiros. */
export function paraCentavos(texto: string): Centavos {
  const { inteiro, fracao } = normalizarDecimal(texto, 2);
  const centavos = Number(inteiro) * 100 + Number((fracao + "00").slice(0, 2));
  if (!Number.isSafeInteger(centavos)) invalido("valor fora da faixa");
  if (centavos > TETO_CENTAVOS) invalido("valor acima de R$ 1.000.000,00");
  return centavos;
}

/** R39: texto do usuário -> milésimos inteiros (1,5 = 1500). */
export function paraMilesimos(texto: string): Milesimos {
  const { inteiro, fracao } = normalizarDecimal(texto, 3);
  const milesimos = Number(inteiro) * 1000 + Number((fracao + "000").slice(0, 3));
  if (!Number.isSafeInteger(milesimos)) invalido("quantidade fora da faixa");
  if (milesimos <= 0) invalido("quantidade deve ser maior que zero");
  if (milesimos > TETO_MILESIMOS) invalido("quantidade acima de 9999,999");
  return milesimos;
}

export function formatarBRL(centavos: Centavos): string {
  if (!Number.isInteger(centavos)) invalido("valor não inteiro em centavos");
  const sinal = centavos < 0 ? "-" : "";
  const absoluto = Math.abs(centavos);
  const reais = Math.floor(absoluto / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resto = String(absoluto % 100).padStart(2, "0");
  return `${sinal}R$ ${reais},${resto}`;
}

export function parcialCentavos(
  quantidadeMilesimos: Milesimos,
  precoUnitarioCentavos: Centavos,
): Centavos {
  if (!Number.isInteger(quantidadeMilesimos) || quantidadeMilesimos <= 0) {
    invalido("quantidade inválida");
  }
  if (!Number.isInteger(precoUnitarioCentavos) || precoUnitarioCentavos < 0) {
    invalido("preço inválido");
  }
  const produto = quantidadeMilesimos * precoUnitarioCentavos;
  return Math.floor((produto + 500) / 1000);
}