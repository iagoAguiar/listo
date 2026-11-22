import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ListaRegistro } from "../../dados/db";
import { useRepositorio } from "../Provedor";
import { formatarBRL } from "../formato";

export default function Inicio() {
  const repo = useRepositorio();
  const [total, setTotal] = useState(0);
  const [recentes, setRecentes] = useState<ListaRegistro[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    const mesCorrente = new Date().toLocaleDateString("sv-SE").slice(0, 7);

    void (async () => {
      const [soma, ultimas] = await Promise.all([
        repo.totalDoMes(mesCorrente),
        repo.ultimasConcluidas(5),
      ]);
      if (!ativo) return;
      setTotal(soma);
      setRecentes(ultimas);
      setCarregado(true);
    })();

    return () => {
      ativo = false;
    };
  }, [repo]);

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>ListO</h1>
        <nav className="acoes">
          <Link to="/listas">Ver listas</Link>
          <Link to="/listas/nova">Nova lista</Link>
        </nav>
      </header>

      {!carregado ? (
        <p>Carregando…</p>
      ) : (
        <>
          <section className="cartao destaque">
            <span className="rotulo">Gasto no mês</span>
            <strong className="valor" data-testid="total-do-mes">
              {formatarBRL(total)}
            </strong>
          </section>

          <section>
            <h2>Últimas compras</h2>
            {recentes.length === 0 ? (
              <p className="vazio">
                Nenhuma compra concluída ainda.{" "}
                <Link to="/listas/nova">Criar primeira lista</Link>
              </p>
            ) : (
              <ul className="lista-limpa">
                {recentes.map((lista) => (
                  <li key={lista.id} data-testid="compra-recente" className="cartao">
                    <span>{lista.nome}</span>
                    <span className="data">{lista.data_conclusao}</span>
                    <strong className="valor">{formatarBRL(lista.valor_final_centavos ?? 0)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
