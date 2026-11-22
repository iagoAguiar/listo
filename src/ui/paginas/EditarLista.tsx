import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ListaRegistro } from "../../dados/db";
import { formatarBRL, paraCentavos } from "../../dominio/dinheiro";
import { FORMAS_PAGAMENTO, TIPOS_COMPRA, type FormaPagamento, type TipoCompra } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { mascararDinheiro, mensagemDeErro } from "../formato";

export default function EditarLista() {
  const { id = "" } = useParams();
  const repo = useRepositorio();
  const navegar = useNavigate();

  const [lista, setLista] = useState<ListaRegistro | null>(null);
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState<TipoCompra>("mensal");
  const [orcamento, setOrcamento] = useState("");
  const [mercado, setMercado] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [erro, setErro] = useState("");

  useEffect(() => {
    void (async () => {
      const registro = await repo.obterLista(id);
      if (!registro) return;
      setLista(registro);
      setNome(registro.nome);
      setData(registro.data);
      setTipo(registro.tipo);
      setOrcamento(mascararDinheiro(String(registro.orcamento_centavos)));
      setMercado(registro.mercado ?? "");
      setFormaPagamento(registro.forma_pagamento);
    })();
  }, [id, repo]);

  if (!lista) return <main className="tela">Carregando…</main>;

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    try {
      await repo.editarLista(id, {
        nome,
        data,
        tipo,
        orcamentoCentavos: orcamento ? paraCentavos(orcamento) : 0,
        mercado,
        formaPagamento,
      });
      navegar(`/listas/${id}`);
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^lista inválida: /, ""));
    }
  }

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>Editar lista</h1>
        <nav className="acoes">
          <Link to={`/listas/${id}`}>Cancelar</Link>
        </nav>
      </header>

      <form className="formulario" onSubmit={salvar}>
        <label>
          Nome da lista
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
        </label>
        <label>
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCompra)}>
            {TIPOS_COMPRA.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </label>
        <label>
          Orçamento
          <input
            inputMode="numeric"
            value={orcamento}
            onChange={(e) => setOrcamento(mascararDinheiro(e.target.value))}
          />
        </label>
        <label>
          Mercado (opcional)
          <input value={mercado} onChange={(e) => setMercado(e.target.value)} />
        </label>
        <label>
          Forma de pagamento
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
          >
            {FORMAS_PAGAMENTO.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </label>
        {erro ? (
          <p role="alert" className="erro">
            {erro}
          </p>
        ) : null}
        <button type="submit">Salvar alterações</button>
      </form>

      <p className="detalhe">Orçamento atual: {formatarBRL(lista.orcamento_centavos)}</p>
    </main>
  );
}
