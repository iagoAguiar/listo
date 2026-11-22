import { createContext, useContext, type ReactNode } from "react";
import type { Repositorio } from "../dados/repositorio";

const ContextoRepositorio = createContext<Repositorio | null>(null);

export function ProvedorRepositorio({
  repo,
  children,
}: {
  repo: Repositorio;
  children: ReactNode;
}) {
  return <ContextoRepositorio.Provider value={repo}>{children}</ContextoRepositorio.Provider>;
}

export function useRepositorio(): Repositorio {
  const repo = useContext(ContextoRepositorio);
  if (!repo) throw new Error("useRepositorio usado fora do ProvedorRepositorio");
  return repo;
}
