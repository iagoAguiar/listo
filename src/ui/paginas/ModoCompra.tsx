import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { ItemRegistro, ListaRegistro } from "../../dados/db";
import type { SugestaoProduto } from "../../dados/repositorio";
import { formatarBRL, paraCentavos, paraMilesimos, parcialCentavos } from "../../dominio/dinheiro";
import { totalCarrinhoCentavos, totalEstimadoCentavos } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { formatarQuantidade, mascararDinheiro, mensagemDeErro, slug } from "../formato";

export default function ModoCompra() {
  const { id = "" } = useParams();
  const repo = useRepositorio();

  const campoNome = useRef<HTMLInputElement>(null);
  const iniciou = useRef(false);

  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [itens, setItens] = useState<ItemRegistro[]>([]);
  const [erro, setErro] = useState("");
  const [sugestoes, setSugestoes] = useState<SugestaoProduto[]>([]);

  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("1");
  const [salvarNoCatalogo, setSalvarNoCatalogo] = useState(true);

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
    if (!lista || lista.status !== "planejamento" || iniciou.current) return;
    iniciou.current = true;
    void repo.iniciarCompra(id).then(() => recarregar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, id, repo]);

  useEffect(() => {
    let ativo = true;
    const texto = novoNome.trim();
    if (texto.length < 2) {
      setSugestoes([]);
      return undefined;
    }
    void (async () => {
      const achados = await repo.sugerirProdutos(texto);
      if (ativo) setSugestoes(achados.slice(0, 3));
    })();
    return () => {
      ativo = false;
    };
  }, [novoNome, repo]);

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

  /** Campos de preço e quantidade são não-controlados: a máscara escreve no próprio DOM
   *  e o commit acontece no blur, lendo o valor final do campo. */
  async function salvarEdicao(item: ItemRegistro, campo: "preco" | "quantidade", texto: string) {
    try {
      const patch: { precoUnitarioCentavos?: number; quantidadeMilesimos?: number } = {};

      if (campo === "preco") {
        const centavos = texto ? paraCentavos(texto) : 0;
        if (centavos === item.preco_unitario_centavos) return;
        patch.precoUnitarioCentavos = centavos;
      } else {
        const milesimos = paraMilesimos(texto || "1");
        if (milesimos === item.quantidade_milesimos) return;
        patch.quantidadeMilesimos = milesimos;
      }

      await repo.editarItem(item.id, patch);
      setErro("");
      await recarregar();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  function escolherSugestao(sugestao: SugestaoProduto) {
    setNovoNome(sugestao.nome);
    setNovoPreco(mascararDinheiro(String(sugestao.precoSugeridoCentavos)));
    setSugestoes([]);
    campoNome.current?.focus();
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
      setSugestoes([]);
      await recarregar();
      campoNome.current?.focus();
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^item inválido: /, ""));
    }
  }

  return (
    <main className="tela tarefa compra">
      <header className="cabecalho">
        <Link to={`/listas/${id}`}>Voltar</Link>
        <h1>{lista.nome}</h1>
      </header>

      <form className="formulario compositor" onSubmit={adicionarRapido}>
        <div className="compositor-campos">
          <label>
            Novo item
            <input
              ref={campoNome}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              maxLength={80}
              autoComplete="off"
            />
          </label>
          <label>
            Qtd
            <input
              aria-label="Quantidade"
              inputMode="decimal"
              value={novaQuantidade}
              onChange={(e) => setNovaQuantidade(e.target.value.replace(/[^\d.,]/g, ""))}
            />
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
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={salvarNoCatalogo}
            onChange={(e) => setSalvarNoCatalogo(e.target.checked)}
          />
          Salvar este produto no meu catálogo
        </label>
        {sugestoes.length > 0 ? (
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
        <button type="submit">Adicionar e marcar</button>
      </form>

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
          return (
            <li
              key={item.id}
              className={item.adquirido ? "item item-compra marcado" : "item item-compra"}
              data-testid={`linha-item-${slug(item.nome)}`}
            >
              <label className="linha-principal">
                <input
                  type="checkbox"
                  checked={item.adquirido}
                  onChange={() => void alternar(item)}
                />
                <span className="item-corpo">
                  <span className={item.adquirido ? "nome riscado" : "nome"}>{item.nome}</span>
                  <span className="detalhe">
                    {formatarQuantidade(item.quantidade_milesimos)} ×{" "}
                    {formatarBRL(item.preco_unitario_centavos)}
                  </span>
                </span>
                <strong className="valor">
                  {formatarBRL(
                    parcialCentavos(item.quantidade_milesimos, item.preco_unitario_centavos),
                  )}
                </strong>
              </label>

              <div className="linha-edicao">
                <input
                  key={`qtd-${item.id}-${item.quantidade_milesimos}`}
                  aria-label={`Quantidade de ${item.nome}`}
                  inputMode="decimal"
                  defaultValue={formatarQuantidade(item.quantidade_milesimos)}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^\d.,]/g, "");
                  }}
                  onBlur={(e) => void salvarEdicao(item, "quantidade", e.target.value)}
                />
                <input
                  key={`preco-${item.id}-${item.preco_unitario_centavos}`}
                  aria-label={`Preço de ${item.nome}`}
                  inputMode="numeric"
                  defaultValue={mascararDinheiro(String(item.preco_unitario_centavos))}
                  onChange={(e) => {
                    e.target.value = mascararDinheiro(e.target.value);
                  }}
                  onBlur={(e) => void salvarEdicao(item, "preco", e.target.value)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="rodape-acao duplo">
        <button
          type="button"
          aria-label="+"
          className="botao-secundario"
          onClick={() => campoNome.current?.focus()}
        >
          +
        </button>
        <Link className="botao" to={`/listas/${id}/finalizar`}>
          Finalizar compra
        </Link>
      </footer>
    </main>
  );
}
