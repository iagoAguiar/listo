import { describe, expect, it } from "vitest";
import {
  saldoCentavos,
  totalCarrinhoCentavos,
  totalEstimadoCentavos,
  validarLista,
  valorFinalCentavos,
  type ItemDaLista,
} from "../../src/dominio/lista";

const item = (
  nome: string,
  quantidadeMilesimos: number,
  precoUnitarioCentavos: number,
  adquirido = false,
): ItemDaLista => ({ nome, quantidadeMilesimos, precoUnitarioCentavos, adquirido });

const listaValida = {
  nome: "Compras do mês",
  data: "2026-11-22",
  tipo: "mensal" as const,
  orcamentoCentavos: 40000,
  formaPagamento: "pix" as const,
};

describe("CA-R4 / CA-R42: validação de lista", () => {
  it("aceita lista com nome e orçamento válidos", () => {
    expect(validarLista(listaValida).ok).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const r = validarLista({ ...listaValida, nome: "   " });
    expect(r.ok).toBe(false);
    expect(r.erros.join(" ")).toContain("nome");
  });

  it("rejeita orçamento zero (R42)", () => {
    const r = validarLista({ ...listaValida, orcamentoCentavos: 0 });
    expect(r.ok).toBe(false);
    expect(r.erros.join(" ")).toContain("orçamento");
  });

  it("rejeita nome com mais de 60 caracteres", () => {
    const r = validarLista({ ...listaValida, nome: "a".repeat(61) });
    expect(r.ok).toBe(false);
  });

  it("aceita nome repetido: nome não é chave (R41)", () => {
    expect(validarLista({ ...listaValida, nome: "Compras do mês" }).ok).toBe(true);
  });
});

describe("CA-R16: total estimado", () => {
  it("soma os parciais de todos os itens", () => {
    const itens = [item("Picanha", 2000, 7000), item("Carvão", 1000, 5000)];
    expect(totalEstimadoCentavos(itens)).toBe(19000);
  });

  it("lista vazia soma zero", () => {
    expect(totalEstimadoCentavos([])).toBe(0);
  });
});

describe("CA-R17: saldo do orçamento", () => {
  it("positivo quando o total está abaixo do orçamento", () => {
    expect(saldoCentavos(20000, 19000)).toBe(1000);
  });

  it("negativo quando o total estoura o orçamento", () => {
    expect(saldoCentavos(20000, 21000)).toBe(-1000);
  });
});

describe("CA-R18: total no carrinho", () => {
  it("soma só os itens marcados como adquiridos", () => {
    const itens = [item("Arroz", 1000, 2500, true), item("Feijão", 1000, 3990, true), item("Café", 1000, 1999, false)];
    expect(totalCarrinhoCentavos(itens)).toBe(6490);
  });

  it("sem item marcado o carrinho é zero", () => {
    expect(totalCarrinhoCentavos([item("Arroz", 1000, 2500)])).toBe(0);
  });
});

describe("CA-R30 / D-005: valor final soma todos os itens", () => {
  it("inclui item não marcado no valor final", () => {
    const itens = [
      item("Arroz", 1000, 2500, true),
      item("Café", 1000, 1999, false),
      item("Sabão", 1000, 1000, false),
    ];
    expect(valorFinalCentavos(itens)).toBe(5499);
  });

  it("valor final é igual ao total estimado da lista", () => {
    const itens = [item("Arroz", 1000, 2500, true), item("Café", 1000, 1999, false)];
    expect(valorFinalCentavos(itens)).toBe(totalEstimadoCentavos(itens));
  });
});