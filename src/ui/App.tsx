import { Route, Routes } from "react-router-dom";
import Inicio from "./paginas/Inicio";
import Listas from "./paginas/Listas";
import NovaLista from "./paginas/NovaLista";
import DetalheLista from "./paginas/DetalheLista";
import EditarLista from "./paginas/EditarLista";
import ModoCompra from "./paginas/ModoCompra";
import Finalizar from "./paginas/Finalizar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/listas" element={<Listas />} />
      <Route path="/listas/nova" element={<NovaLista />} />
      <Route path="/listas/:id" element={<DetalheLista />} />
      <Route path="/listas/:id/editar" element={<EditarLista />} />
      <Route path="/listas/:id/compra" element={<ModoCompra />} />
      <Route path="/listas/:id/finalizar" element={<Finalizar />} />
      <Route path="*" element={<p>Página não encontrada</p>} />
    </Routes>
  );
}
