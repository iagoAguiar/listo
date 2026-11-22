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

export function paraCentavos(_texto: string): Centavos {
  throw new Error("não implementado: paraCentavos (R38)");
}

export function paraMilesimos(_texto: string): Milesimos {
  throw new Error("não implementado: paraMilesimos (R39)");
}

export function formatarBRL(_centavos: Centavos): string {
  throw new Error("não implementado: formatarBRL (R17)");
}

export function parcialCentavos(
  _quantidadeMilesimos: Milesimos,
  _precoUnitarioCentavos: Centavos,
): Centavos {
  throw new Error("não implementado: parcialCentavos (R15)");
}