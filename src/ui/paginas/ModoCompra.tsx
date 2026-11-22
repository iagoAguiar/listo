import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import { formatarBRL, paraCentavos, paraMilesimos, parcialCentavos } from "../../dominio/dinheiro";
import { totalCarrinhoCentavos, totalEstimadoCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { formatarQuantidade, mascararDinheiro, mensagemDeErro, slug } from "../formato";

export default function ModoCompra() {
  const { id = "" } = useParams();
  const repo = useRepositorio();

  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("1");
  const [salvarNoCatalogo, setSalvarNoCatalogo] = useState(true);

  const [edicoes, setEdicoes] = useState<Record<string, { preco?: string; quantidade?: string }>>({});

  async function recarregar() {
    const [registro, listaDeItens] = await Promise.all([repo.obterLista(id), repo.listarItens(id)]);
    setLista(registro ?? null);
    setItens(listaDeItens);
    setEdicoes({});
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, repo]);

  if (!lista) return <main className="tela">Carregando…</main>;

  const ordenados = [...itens].sort(
    (a, b) => Number(a.adquirido) - Number(b.adquirido) || a.ordem - b.ordem,
  );

  const dominio = itens.map((item) => ({
    nome: item.nome,
    quantidadeMilesimos: item.quantidade_milesimos,
    precoUnitarioCentavos: item.preco_unitario_centavos,
    adquirido: item.adquirido,
  }));
  const totalEstimado = totalEstimadoCentavos(dominio);
  const noCarrinho = totalCarrinhoCentavos(dominio);

  async function alternar(item: ItemRegistro) {
    await repo.marcarAdquirido(item.id, !item.adquirido);
    await recarregar();
  }

  function editarLocal(itemId: string, campo: "preco" | "quantidade", valor: string) {
    setEdicoes((atual) => ({
      ...atual,
      [itemId]: { ...atual[itemId], [campo]: campo === "preco" ? mascararDinheiro(valor) : valor.replace(/[^\d.,]/g, "") },
    }));
  }

  async function confirmarEdicao(item: ItemRegistro) {
    const edicao = edicoes[item.id];
    if (!edicao) return;

    try {
      const patch: { precoUnitarioCentavos?: number; quantidadeMilesimos?: number } = {};
      if (edicao.preco) patch.precoUnitarioCentavos = paraCentavos(edicao.preco);
      if (edicao.quantidade) patch.quantidadeMilesimos = paraMilesimos(edicao.quantidade);
      if (Object.keys(patch).length === 0) return;

      await repo.editarItem(item.id, patch);
      setErro("");
      await recarregar();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  async function adicionarRapido(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    try {
      await repo.adicionarItem(
        id,
        {
          nome: novoNome,
          quantidadeMilesimos: paraMilesimos(novaQuantidade || "1"),
          precoUnitarioCentavos: novoPreco ? paraCentavos(novoPreco) : 0,
        },
        { adquirido: true },
      );
      setNovoNome("");
      setNovoPreco("");
      setNovaQuantidade("1");
      setAberto(false);
      await recarregar();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  return (
    <main className="tela compra">
      <header className="cabecalho">
        <Link to={`/listas/${id}`}>Voltar</Link>
        <h1>{lista.nome}</h1>
      </header>

      <section className="cartao totais duplo">
        <div>
          <span className="rotulo">Total estimado</span>
          <strong className="valor" data-testid="valor-final">
            {formatarBRL(totalEstimado)}
          </strong>
        </div>
        <div>
          <span className="rotulo">Total no carrinho</span>
          <strong className="valor" data-testid="no-carrinho">
            {formatarBRL(noCarrinho)}
          </strong>
        </div>
      </section>

      <ul className="lista-limpa">
        {ordenados.map((item) => {
          const edicao = edicoes[item.id];
          return (
            <li
              key={item.id}
              className={item.adquirido ? "item-compra marcado" : "item-compra"}
              data-testid={`linha-item-${slug(item.nome)}`}
            >
              <label className="linha-principal">
                <input
                  type="checkbox"
                  checked={item.adquirido}
                  onChange={() => void alternar(item)}
                />
                <span className={item.adquirido ? "nome riscado" : "nome"}>{item.nome}</span>
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

              <div className="linha-edicao">
                <input
                  aria-label={`Quantidade de ${item.nome}`}
                  inputMode="decimal"
                  value={edicao?.quantidade ?? formatarQuantidade(item.quantidade_milesimos)}
                  onChange={(e) => editarLocal(item.id, "quantidade", e.target.value)}
                  onBlur={() => void confirmarEdicao(item)}
                />
                <input
                  aria-label={`Preço de ${item.nome}`}
                  inputMode="numeric"
                  value={edicao?.preco ?? mascararDinheiro(String(item.preco_unitario_centavos))}
                  onChange={(e) => editarLocal(item.id, "preco", e.target.value)}
                  onBlur={() => void confirmarEdicao(item)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {erro ? (
        <p role="alert" className="erro">
          {erro}
        </p>
      ) : null}

      {aberto ? (
        <form className="formulario cartao" onSubmit={adicionarRapido}>
          <h2>Novo item</h2>
          <label>
            Novo item
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} maxLength={80} />
          </label>
          <label>
            Preço
            <input
              inputMode="numeric"
              value={novoPreco}
              placeholder="0,00"
              onChange={(e) => setNovoPreco(mascararDinheiro(e.target.value))}
            />
          </label>
          <label>
            Quantidade
            <input
              inputMode="decimal"
              value={novaQuantidade}
              onChange={(e) => setNovaQuantidade(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={salvarNoCatalogo}
              onChange={(e) => setSalvarNoCatalogo(e.target.checked)}
            />
            Salvar este produto no meu catálogo
          </label>
          <button type="submit">Adicionar e marcar</button>
        </form>
      ) : null}

      <footer className="rodape-acao duplo">
        <button type="button" aria-label="+" className="botao-secundario" onClick={() => setAberto(!aberto)}>
          +
        </button>
        <Link className="botao" to={`/listas/${id}/finalizar`}>
          Finalizar compra
        </Link>
      </footer>
    </main>
  );
}
