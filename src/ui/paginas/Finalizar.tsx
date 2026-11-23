import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import { formatarBRL } from "../../dominio/dinheiro";
import { valorFinalCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";

export default function Finalizar() {
  const { id = "" } = useParams();
  const repo = useRepositorio();
  const navegar = useNavigate();
  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);
  const [ocupado, setOcupado] = useState(false);

  async function recarregar() {
    const [registro, listaDeItens] = await Promise.all([repo.obterLista(id), repo.listarItens(id)]);
    setLista(registro ?? null);
    setItens(listaDeItens);
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, repo]);

  if (!lista) return <main className="tela">Carregando…</main>;

  const marcados = itens.filter((item) => item.adquirido).length;
  const valorFinal = valorFinalCentavos(
    itens.map((item) => ({
      nome: item.nome,
      quantidadeMilesimos: item.quantidade_milesimos,
      precoUnitarioCentavos: item.preco_unitario_centavos,
      adquirido: item.adquirido,
    })),
  );

  async function excluirNaoMarcados() {
    setOcupado(true);
    for (const item of itens.filter((registro) => !registro.adquirido)) {
      await repo.removerItem(item.id);
    }
    await recarregar();
    setOcupado(false);
  }

  async function confirmar() {
    setOcupado(true);
    await repo.concluirLista(id);
    navegar("/");
  }

  return (
    <main className="tela">
      <header className="cabecalho">
        <Link to={`/listas/${id}/compra`}>Voltar</Link>
        <h1>Finalizar — {lista.nome}</h1>
      </header>

      <section className="cartao destaque">
        <span className="rotulo">Valor final</span>
        <strong className="dinheiro-grande" data-testid="valor-final">
          {formatarBRL(valorFinal)}
        </strong>
        <span className="detalhe" data-testid="contagem">
          {marcados} marcados de {itens.length} itens
        </span>
      </section>

      <div className="acoes-verticais">
        <button type="button" onClick={() => void excluirNaoMarcados()} disabled={ocupado}>
          Excluir não marcados
        </button>
        <button type="button" className="primario" onClick={() => void confirmar()} disabled={ocupado}>
          Confirmar compra
        </button>
      </div>
    </main>
  );
}
