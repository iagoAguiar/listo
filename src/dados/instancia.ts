import { criarBanco } from "./db";
import { criarRepositorio } from "./repositorio";

/** Banco e repositório do app real. Os testes montam instâncias próprias. */
export const banco = criarBanco();
export const repositorio = criarRepositorio(banco);
