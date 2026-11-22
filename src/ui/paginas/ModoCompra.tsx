import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import { formatarBRL, parcialCentavos } from "../../dominio/dinheiro";
import { totalCarrinhoCentavos, valorFinalCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { formatarQuantidade, slug } from "../formato";

export default function ModoCompra() {
  const { id = "" } = useParams();
  const repo = useRepositorio();
  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);

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

  const paraDominio = itens.map((item) => ({
    nome: item.nome,
    quantidadeMilesimos: item.quantidade_milesimos,
    precoUnitarioCentavos: item.preco_unitario_centavos,
    adquirido: item.adquirido,
  }));

  const valorFinal = valorFinalCentavos(paraDominio);
  const noCarrinho = totalCarrinhoCentavos(paraDominio);

  async function alternar(item: ItemRegistro) {
    await repo.marcarAdquirido(item.id, !item.adquirido);
    await recarregar();
  }

  return (
    <main className="tela compra">
      <header className="cabecalho">
        <Link to={`/listas/${id}`}>Voltar</Link>
        <h1>{lista.nome}</h1>
      </header>

      <section className="cartao totais duplo">
        <div>
          <span className="rotulo">Valor final</span>
          <strong className="valor" data-testid="valor-final">
            {formatarBRL(valorFinal)}
          </strong>
        </div>
        <div>
          <span className="rotulo">No carrinho</span>
          <strong className="valor" data-testid="no-carrinho">
            {formatarBRL(noCarrinho)}
          </strong>
        </div>
      </section>

      <ul className="lista-limpa">
        {itens.map((item) => (
          <li key={item.id}>
            <label
              className={item.adquirido ? "item-compra marcado" : "item-compra"}
              data-testid={`linha-item-${slug(item.nome)}`}
            >
              <input
                type="checkbox"
                checked={item.adquirido}
                onChange={() => void alternar(item)}
              />
              <span className="nome">{item.nome}</span>
              <span className="detalhe">
                {formatarQuantidade(item.quantidade_milesimos)} ×{" "}
                {formatarBRL(item.preco_unitario_centavos)}
              </span>
              <strong className="valor">
                {formatarBRL(
                  parcialCentavos(item.quantidade_milesimos, item.preco_unitario_centavos),
                )}
              </strong>
            </label>
          </li>
        ))}
      </ul>

      <footer className="rodape-acao">
        <Link className="botao" to={`/listas/${id}/finalizar`}>
          Finalizar compra
        </Link>
      </footer>
    </main>
  );
}
