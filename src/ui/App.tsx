import { Route, Routes, useLocation } from "react-router-dom";
import BarraInferior from "./BarraInferior";
import Inicio from "./paginas/Inicio";
import Listas from "./paginas/Listas";
import NovaLista from "./paginas/NovaLista";
import DetalheLista from "./paginas/DetalheLista";
import Ajustes from "./paginas/Ajustes";
import EditarLista from "./paginas/EditarLista";
import ModoCompra from "./paginas/ModoCompra";
import Finalizar from "./paginas/Finalizar";

const ROTAS_COM_BARRA = new Set(["/", "/listas", "/ajustes"]);

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/listas" element={<Listas />} />
      <Route path="/ajustes" element={<Ajustes />} />
      <Route path="/listas/nova" element={<NovaLista />} />
      <Route path="/listas/:id" element={<DetalheLista />} />
      <Route path="/listas/:id/editar" element={<EditarLista />} />
      <Route path="/listas/:id/compra" element={<ModoCompra />} />
      <Route path="/listas/:id/finalizar" element={<Finalizar />} />
      <Route path="*" element={<main className="tela"><p>Página não encontrada</p></main>} />
    </Routes>
    {ROTAS_COM_BARRA.has(pathname) ? <BarraInferior /> : null}
    </div>
  );
}
