import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import { formatarBRL, paraCentavos, paraMilesimos, parcialCentavos } from "../../dominio/dinheiro";
import { saldoCentavos, totalEstimadoCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { formatarQuantidade, mascararDinheiro, mensagemDeErro } from "../formato";

export default function DetalheLista() {
  const { id = "" } = useParams();
  const repo = useRepositorio();

  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);
  const [removido, setRemovido] = useState<ItemRegistro | null>(null);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  async function recarregar() {
    const [registro, listaDeItens] = await Promise.all([repo.obterLista(id), repo.listarItens(id)]);
    setLista(registro ?? null);
    setItens(listaDeItens);
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, repo]);

  useEffect(() => {
    if (!removido) return undefined;
    const relogio = setTimeout(() => setRemovido(null), 8000);
    return () => clearTimeout(relogio);
  }, [removido]);

  if (!lista) return <main className="tela">Carregando…</main>;

  const somenteLeitura = lista.status === "concluida";
  const total = totalEstimadoCentavos(
    itens.map((item) => ({
      nome: item.nome,
      quantidadeMilesimos: item.quantidade_milesimos,
      precoUnitarioCentavos: item.preco_unitario_centavos,
      adquirido: item.adquirido,
    })),
  );
  const saldo = saldoCentavos(lista.orcamento_centavos, total);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    try {
      await repo.adicionarItem(id, {
        nome,
        quantidadeMilesimos: paraMilesimos(quantidade),
        precoUnitarioCentavos: preco ? paraCentavos(preco) : 0,
      });
      setNome("");
      setQuantidade("");
      setPreco("");
      await recarregar();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  async function remover(item: ItemRegistro) {
    await repo.removerItem(item.id);
    setRemovido(item);
    await recarregar();
  }

  async function desfazer() {
    if (!removido) return;
    await repo.restaurarItem(removido);
    setRemovido(null);
    await recarregar();
  }

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>{lista.nome}</h1>
        <nav className="acoes">
          <Link to="/listas">Listas</Link>
          {somenteLeitura ? null : <Link to={`/listas/${id}/compra`}>Modo compra</Link>}
          {somenteLeitura ? null : <Link to={`/listas/${id}/finalizar`}>Finalizar</Link>}
        </nav>
      </header>

      <section className="cartao totais">
        <div>
          <span className="rotulo">Total estimado</span>
          <strong className="valor" data-testid="total-estimado">
            {formatarBRL(total)}
          </strong>
        </div>
        <div>
          <span className="rotulo">Orçamento</span>
          <strong className="valor" data-testid="orcamento">
            {formatarBRL(lista.orcamento_centavos)}
          </strong>
        </div>
        <div>
          <span className="rotulo">Saldo</span>
          <strong className={saldo < 0 ? "valor negativo" : "valor"} data-testid="saldo">
            {formatarBRL(saldo)}
          </strong>
        </div>
      </section>

      {somenteLeitura ? (
        <p className="aviso">Lista concluída — somente leitura.</p>
      ) : (
        <form className="formulario linha" onSubmit={adicionar}>
          <label>
            Item
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
          </label>
          <label>
            Quantidade
            <input
              inputMode="decimal"
              placeholder="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          </label>
          <label>
            Preço unitário
            <input
              inputMode="numeric"
              value={preco}
              onChange={(e) => setPreco(mascararDinheiro(e.target.value))}
              placeholder="0,00"
            />
          </label>
          <button type="submit">Adicionar</button>
        </form>
      )}

      {erro ? (
        <p role="alert" className="erro">
          {erro}
        </p>
      ) : null}

      <ul className="lista-limpa">
        {itens.map((item) => (
          <li key={item.id} className="cartao item" data-testid={`linha-item-${item.nome.toLowerCase()}`}>
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
            {somenteLeitura ? null : (
              <button
                type="button"
                className="discreto"
                aria-label={`Remover ${item.nome}`}
                onClick={() => void remover(item)}
              >
                Remover
              </button>
            )}
          </li>
        ))}
      </ul>

      {removido ? (
        <div className="aviso acao-desfazer" role="status">
          Item removido.{" "}
          <button type="button" onClick={() => void desfazer()}>
            Desfazer
          </button>
        </div>
      ) : null}
    </main>
  );
}
