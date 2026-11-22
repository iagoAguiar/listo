import { formatarBRL } from "../dominio/dinheiro";

/** 2000 milésimos -> "2"; 750 -> "0,75"; 1500 -> "1,5". */
export function formatarQuantidade(milesimos: number): string {
  const inteiro = Math.floor(milesimos / 1000);
  const resto = milesimos % 1000;
  if (resto === 0) return String(inteiro);
  const fracao = String(resto).padStart(3, "0").replace(/0+$/, "");
  return `${inteiro},${fracao}`;
}

/** Máscara de digitação: só dígitos contam, o resto é formatação. */
export function mascararDinheiro(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 11);
  if (!digitos) return "";
  const centavos = Number(digitos);
  const reais = Math.floor(centavos / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const resto = String(centavos % 100).padStart(2, "0");
  return `${reais},${resto}`;
}

export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "erro inesperado";
}

export { formatarBRL };
