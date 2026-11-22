import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paraCentavos } from "../../dominio/dinheiro";
import { FORMAS_PAGAMENTO, TIPOS_COMPRA, type FormaPagamento, type TipoCompra } from "../../dominio/lista";
import { useRepositorio } from "../Provedor";
import { mascararDinheiro, mensagemDeErro } from "../formato";

const rotuloTipo: Record<TipoCompra, string> = {
  mensal: "Mensal",
  semanal: "Semanal",
  esporadica: "Esporádica",
};

const rotuloPagamento: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  credito: "Crédito",
  debito: "Débito",
  vale: "Vale",
};

function hoje(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export default function NovaLista() {
  const repo = useRepositorio();
  const navegar = useNavigate();

  const [nome, setNome] = useState("");
  const [data, setData] = useState(hoje());
  const [tipo, setTipo] = useState<TipoCompra>("mensal");
  const [orcamento, setOrcamento] = useState("");
  const [mercado, setMercado] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [erro, setErro] = useState("");

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    try {
      const lista = await repo.criarLista({
        nome,
        data,
        tipo,
        orcamentoCentavos: orcamento ? paraCentavos(orcamento) : 0,
        mercado,
        formaPagamento,
      });
      navegar(`/listas/${lista.id}`);
    } catch (problema) {
      setErro(mensagemDeErro(problema).replace(/^lista inválida: /, ""));
    }
  }

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>Nova lista</h1>
        <nav className="acoes">
          <Link to="/">Cancelar</Link>
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
                {rotuloTipo[valor]}
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
            placeholder="0,00"
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
                {rotuloPagamento[valor]}
              </option>
            ))}
          </select>
        </label>

        {erro ? (
          <p role="alert" className="erro">
            {erro}
          </p>
        ) : null}

        <button type="submit">Salvar lista</button>
      </form>
    </main>
  );
}
