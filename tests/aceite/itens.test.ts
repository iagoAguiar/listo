import { describe, expect, it } from "vitest";
import { normalizarNome, validarItem } from "../../src/dominio/item";
import { aplicarItemAoCatalogo, sugerirProdutos, type Produto } from "../../src/dominio/produto";

const produto = (nome: string, ultimo: number): Produto => ({
  id: `id-${nome}`,
  nome,
  nomeNormalizado: normalizarNome(nome),
  precoPadraoCentavos: ultimo,
  ultimoPrecoCentavos: ultimo,
});

describe("CA-R9: validação de item", () => {
  it("aceita item com nome, quantidade e preço válidos", () => {
    expect(validarItem({ nome: "Arroz 5kg", quantidadeMilesimos: 1000, precoUnitarioCentavos: 2500 }).ok).toBe(true);
  });

  it("rejeita quantidade zero", () => {
    const r = validarItem({ nome: "Arroz", quantidadeMilesimos: 0, precoUnitarioCentavos: 2500 });
    expect(r.ok).toBe(false);
    expect(r.erros.join(" ")).toContain("quantidade");
  });

  it("rejeita preço negativo", () => {
    const r = validarItem({ nome: "Arroz", quantidadeMilesimos: 1000, precoUnitarioCentavos: -1 });
    expect(r.ok).toBe(false);
    expect(r.erros.join(" ")).toContain("preço");
  });

  it("aceita preço zero (item a pesar no mercado)", () => {
    expect(validarItem({ nome: "Banana", quantidadeMilesimos: 1000, precoUnitarioCentavos: 0 }).ok).toBe(true);
  });

  it("rejeita nome vazio", () => {
    expect(validarItem({ nome: " ", quantidadeMilesimos: 1000, precoUnitarioCentavos: 100 }).ok).toBe(false);
  });
});

describe("R10 / R14: normalização de nome", () => {
  it("remove acento, caixa e espaços extras", () => {
    expect(normalizarNome("  Leite  Integral ")).toBe("leite integral");
    expect(normalizarNome("AÇÚCAR Refinado")).toBe("acucar refinado");
  });
});

describe("CA-R14: catálogo não duplica", () => {
  it("cria produto novo quando o nome não existe", () => {
    const catalogo = aplicarItemAoCatalogo([], { nome: "Leite Integral", precoUnitarioCentavos: 749 });
    expect(catalogo).toHaveLength(1);
    expect(catalogo[0]?.nome).toBe("Leite Integral");
    expect(catalogo[0]?.ultimoPrecoCentavos).toBe(749);
  });

  it("atualiza o último preço sem duplicar com nome igual", () => {
    const inicial = aplicarItemAoCatalogo([], { nome: "Arroz 5kg", precoUnitarioCentavos: 2500 });
    const depois = aplicarItemAoCatalogo(inicial, { nome: "arroz 5KG", precoUnitarioCentavos: 2790 });
    expect(depois).toHaveLength(1);
    expect(depois[0]?.ultimoPrecoCentavos).toBe(2790);
  });
});

describe("CA-R10 / CA-R11: sugestões do catálogo", () => {
  const catalogo = [produto("Leite Integral", 749), produto("Leite Desnatado", 699), produto("Arroz 5kg", 2500)];

  it("sugere por trecho, ignorando acento e caixa", () => {
    const sugestoes = sugerirProdutos(catalogo, "leite");
    expect(sugestoes).toHaveLength(2);
    expect(sugestoes[0]?.nome).toBe("Leite Integral");
  });

  it("traz o último preço como preço sugerido", () => {
    const [primeira] = sugerirProdutos(catalogo, "arroz");
    expect(primeira?.precoSugeridoCentavos).toBe(2500);
  });

  it("no máximo 5 sugestões", () => {
    const grande = Array.from({ length: 9 }, (_, i) => produto(`Café Tipo ${i}`, 1000 + i));
    expect(sugerirProdutos(grande, "cafe").length).toBeLessThanOrEqual(5);
  });

  it("texto vazio não sugere nada", () => {
    expect(sugerirProdutos(catalogo, "")).toHaveLength(0);
  });
});