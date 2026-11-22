import { describe, expect, it } from "vitest";
import { formatarBRL, paraCentavos, paraMilesimos, parcialCentavos } from "../../src/dominio/dinheiro";

describe("CA-R2: dinheiro é inteiro de centavos", () => {
  it("3 x R$ 19,99 grava 5997 inteiro, nunca float", () => {
    const parcial = parcialCentavos(3000, 1999);
    expect(parcial).toBe(5997);
    expect(Number.isInteger(parcial)).toBe(true);
  });

  it("soma de dez itens de R$ 0,10 dá exatamente 100, não 0.999...", () => {
    const itens = Array.from({ length: 10 }, () => parcialCentavos(1000, 10));
    const total = itens.reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(total).toBe(1 * 100);
  });
});

describe("CA-R15: parcial com quantidade fracionada arredonda half-up uma vez", () => {
  it("0,750 kg a R$ 39,90/kg dá 2993 centavos (R$ 29,93)", () => {
    expect(parcialCentavos(750, 3990)).toBe(2993);
  });

  it("1,5 kg a R$ 7,49/kg dá 1124 centavos (1123,5 arredonda para cima)", () => {
    expect(parcialCentavos(1500, 749)).toBe(1124);
  });

  it("2 unidades a R$ 10,00 dão 2000 centavos", () => {
    expect(parcialCentavos(2000, 1000)).toBe(2000);
  });
});

describe("CA-R38: entrada de dinheiro", () => {
  it("aceita 19,99 e 19.99 e 1.999,99", () => {
    expect(paraCentavos("19,99")).toBe(1999);
    expect(paraCentavos("19.99")).toBe(1999);
    expect(paraCentavos("1.999,99")).toBe(199999);
  });

  it("aceita inteiro sem separador", () => {
    expect(paraCentavos("20")).toBe(2000);
  });

  it("rejeita negativo", () => {
    expect(() => paraCentavos("-5")).toThrow(/entrada inválida/);
  });

  it("rejeita acima de R$ 1.000.000,00", () => {
    expect(() => paraCentavos("1.000.000,01")).toThrow(/entrada inválida/);
  });

  it("rejeita texto sem número", () => {
    expect(() => paraCentavos("abc")).toThrow(/entrada inválida/);
  });
});

describe("CA-R39: entrada de quantidade em milésimos", () => {
  it("aceita 0,750 e 1,5 com até três casas", () => {
    expect(paraMilesimos("0,750")).toBe(750);
    expect(paraMilesimos("1,5")).toBe(1500);
  });

  it("rejeita zero e negativo", () => {
    expect(() => paraMilesimos("0")).toThrow(/entrada inválida/);
    expect(() => paraMilesimos("-1")).toThrow(/entrada inválida/);
  });

  it("rejeita quatro casas decimais", () => {
    expect(() => paraMilesimos("1,2345")).toThrow(/entrada inválida/);
  });

  it("rejeita acima de 9999,999", () => {
    expect(() => paraMilesimos("10000")).toThrow(/entrada inválida/);
  });
});

describe("R17: formatação em reais", () => {
  it("mostra sempre duas casas", () => {
    expect(formatarBRL(1999)).toBe("R$ 19,99");
    expect(formatarBRL(2000)).toBe("R$ 20,00");
    expect(formatarBRL(5)).toBe("R$ 0,05");
    expect(formatarBRL(0)).toBe("R$ 0,00");
  });

  it("usa separador de milhar brasileiro", () => {
    expect(formatarBRL(123456789)).toBe("R$ 1.234.567,89");
  });
});