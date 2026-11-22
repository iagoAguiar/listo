import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { repositorio } from "./dados/instancia";
import App from "./ui/App";
import { ProvedorRepositorio } from "./ui/Provedor";
import "./ui/estilos.css";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("elemento #root não encontrado");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(raiz).render(
  <StrictMode>
    <ProvedorRepositorio repo={repositorio}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ProvedorRepositorio>
  </StrictMode>,
);
