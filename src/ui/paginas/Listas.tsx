import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRepositorio } from "../Provedor";
import { formatarBRL } from "../formato";

interface ListaComTotal {
  id: string;
  nome: string;
  data: string;
  status: string;
  valor_final_centavos: number | null;
  totalEstimadoCentavos: number;
}

const rotuloStatus: Record<string, string> = {
  planejamento: "Planejando",
  comprando: "Comprando",
  concluida: "Concluída",
};

export default function Listas() {
  const repo = useRepositorio();
  const [listas, setListas] = useState<ListaComTotal[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const dados = await repo.listarListasComTotais();
      if (!ativo) return;
      setListas(dados);
      setCarregado(true);
    })();
    return () => {
      ativo = false;
    };
  }, [repo]);

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>Listas</h1>
        <nav className="acoes">
          <Link to="/">Início</Link>
          <Link to="/listas/nova">Nova lista</Link>
        </nav>
      </header>

      {!carregado ? (
        <p>Carregando…</p>
      ) : listas.length === 0 ? (
        <p className="vazio">Nenhuma lista criada ainda.</p>
      ) : (
        <ul className="lista-limpa">
          {listas.map((lista) => {
            const valor =
              lista.status === "concluida"
                ? (lista.valor_final_centavos ?? 0)
                : lista.totalEstimadoCentavos;
            return (
              <li key={lista.id} data-testid="card-lista" className="cartao">
                <Link to={`/listas/${lista.id}`}>{lista.nome}</Link>
                <span className="data">{lista.data}</span>
                <span className="etiqueta">{rotuloStatus[lista.status] ?? lista.status}</span>
                <strong className="valor">{formatarBRL(valor)}</strong>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
