import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import type { SugestaoProduto } from "../../dados/repositorio";
import { formatarBRL, paraCentavos, paraMilesimos, parcialCentavos } from "../../dominio/dinheiro";
import { saldoCentavos, totalEstimadoCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { formatarQuantidade, mascararDinheiro, mensagemDeErro } from "../formato";

export default function DetalheLista() {
  const { id = "" } = useParams();
  const repo = useRepositorio();
  const navegar = useNavigate();

  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);
  const [removido, setRemovido] = useState<ItemRegistro | null>(null);
  const [erro, setErro] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [sugestoes, setSugestoes] = useState<SugestaoProduto[]>([]);

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

  useEffect(() => {
    let ativo = true;
    const texto = nome.trim();
    if (texto.length < 2) {
      setSugestoes([]);
      return undefined;
    }
    void (async () => {
      const achados = await repo.sugerirProdutos(texto);
      if (ativo) setSugestoes(achados.slice(0, 5));
    })();
    return () => {
      ativo = false;
    };
  }, [nome, repo]);

  if (!lista) return <main className="tela">Carregando…</main>;

  const somenteLeitura = lista.status === "concluida";
  const dominio = itens.map((item) => ({
    nome: item.nome,
    quantidadeMilesimos: item.quantidade_milesimos,
    precoUnitarioCentavos: item.preco_unitario_centavos,
    adquirido: item.adquirido,
  }));
  const total = totalEstimadoCentavos(dominio);
  const saldo = saldoCentavos(lista.orcamento_centavos, total);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    try {
      await repo.adicionarItem(id, {
        nome,
        quantidadeMilesimos: paraMilesimos(quantidade || "1"),
        precoUnitarioCentavos: preco ? paraCentavos(preco) : 0,
      });
      setNome("");
      setQuantidade("");
      setPreco("");
      setSugestoes([]);
      await recarregar();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  function escolherSugestao(sugestao: SugestaoProduto) {
    setNome(sugestao.nome);
    setPreco(mascararDinheiro(String(sugestao.precoSugeridoCentavos)));
    setSugestoes([]);
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

  async function excluirLista() {
    await repo.excluirLista(id);
    navegar("/listas");
  }

  return (
    <main className="tela tarefa">
      <header className="cabecalho">
        <h1>{lista.nome}</h1>
        <nav className="acoes">
          {somenteLeitura ? null : <Link to={`/listas/${id}/editar`}>Editar</Link>}
        </nav>
      </header>

      <section className="cartao totais">
        <div>
          <span className="rotulo">{somenteLeitura ? "Valor final" : "Total estimado"}</span>
          <strong
            className="valor"
            data-testid={somenteLeitura ? "valor-final" : "total-estimado"}
          >
            {formatarBRL(somenteLeitura ? (lista.valor_final_centavos ?? 0) : total)}
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

      <p className="detalhe">
        {formatarBRL(Math.abs(saldo))} {saldo < 0 ? "acima do orçamento" : "abaixo do orçamento"} ·{" "}
        {lista.data}
      </p>

      {somenteLeitura ? (
        <p className="aviso">Lista concluída — somente leitura.</p>
      ) : (
        <form className="formulario grade-adicionar" onSubmit={adicionar}>
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

      {sugestoes.length > 0 && !somenteLeitura ? (
        <ul className="sugestoes">
          {sugestoes.map((sugestao) => (
            <li key={sugestao.nome}>
              <button type="button" onClick={() => escolherSugestao(sugestao)}>
                {sugestao.nome} · {formatarBRL(sugestao.precoSugeridoCentavos)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {erro ? (
        <p role="alert" className="erro">
          {erro}
        </p>
      ) : null}

      <ul className="lista-limpa">
        {itens.map((item) => (
          <li key={item.id} className="cartao item" data-testid={`linha-item-${item.nome.toLowerCase()}`}>
            <span className="nome">{item.nome}</span>
            {somenteLeitura ? (
              <span
                className="etiqueta"
                data-testid={item.adquirido ? "marca-adquirido" : "marca-pendente"}
              >
                {item.adquirido ? "Comprado" : "Não comprado"}
              </span>
            ) : null}
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

      <section className="zona-perigo">
        {confirmandoExclusao ? (
          <div className="acoes">
            <button type="button" className="perigo" onClick={() => void excluirLista()}>
              Confirmar exclusão
            </button>
            <button type="button" onClick={() => setConfirmandoExclusao(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="discreto" onClick={() => setConfirmandoExclusao(true)}>
            Excluir lista
          </button>
        )}
      </section>

      {removido ? (
        <div className="aviso acao-desfazer" role="status">
          Item removido.{" "}
          <button type="button" onClick={() => void desfazer()}>
            Desfazer
          </button>
        </div>
      ) : null}

      {somenteLeitura ? null : (
        <footer className="rodape-acao">
          <Link className="botao" to={`/listas/${id}/compra`} onClick={() => void repo.iniciarCompra(id)}>
            Iniciar compra
          </Link>
        </footer>
      )}
    </main>
  );
}
