import { useRef, useState, type ChangeEvent } from "react";
import { useRepositorio } from "../Provedor";
import { mensagemDeErro } from "../formato";

export default function Ajustes() {
  const repo = useRepositorio();
  const campoArquivo = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function exportar() {
    setErro("");
    setMensagem("");
    try {
      const bruto = await repo.exportarBackup();
      const arquivo = new Blob([bruto], { type: "application/json" });
      const endereco = URL.createObjectURL(arquivo);
      const ancora = document.createElement("a");
      ancora.href = endereco;
      ancora.download = `listo-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(ancora);
      ancora.click();
      ancora.remove();
      URL.revokeObjectURL(endereco);
      setMensagem("Backup gerado e baixado no aparelho.");
    } catch (problema) {
      setErro(mensagemDeErro(problema));
    }
  }

  async function importar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setErro("");
    setMensagem("");
    try {
      const { importados } = await repo.importarBackup(await arquivo.text());
      setMensagem(
        importados === 1 ? "1 lista importada." : `${importados} listas importadas.`,
      );
    } catch (problema) {
      setErro(mensagemDeErro(problema));
    } finally {
      evento.target.value = "";
    }
  }

  return (
    <main className="tela">
      <header className="cabecalho">
        <h1>Ajustes</h1>
      </header>

      <section className="cartao">
        <h2>Backup</h2>
        <p className="detalhe">
          O ListO guarda tudo no aparelho. Exporte um arquivo para não perder as listas ao
          trocar de celular.
        </p>
        <div className="acoes-verticais">
          <button type="button" onClick={() => void exportar()}>
            Exportar backup
          </button>
          <button type="button" onClick={() => campoArquivo.current?.click()}>
            Importar backup
          </button>
          <input
            ref={campoArquivo}
            type="file"
            accept="application/json,.json"
            aria-label="Arquivo de backup"
            className="oculto"
            onChange={(evento) => void importar(evento)}
          />
        </div>
      </section>

      {mensagem ? (
        <p role="status" className="aviso">
          {mensagem}
        </p>
      ) : null}
      {erro ? (
        <p role="alert" className="erro">
          {erro}
        </p>
      ) : null}
    </main>
  );
}
