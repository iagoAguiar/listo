# Histórico — ListO

Append-only. Uma linha por evento relevante, com data.

- 2026-11-22 — Fase 0: pasta `Desktop/projetos/ListO` criada, `git init` em `main`, estrutura v5 (`.hermes-flow/`, `_hermes/`, `src/`, `tests/`, `docs/`), `AGENTS.md`, `README.md`, `.gitignore`. Repo privado `iagoAguiar/listo` criado no GitHub. Aguardando detalhes do produto.
- 2026-11-22 — Fase 1: doc base do ListO lido (923 linhas, em `G:/My Drive/.../00_Ideias/ListO.md`) e copiado para `docs/base/ListO-base.md`. `intent.md` preenchido. Recorte de escopo em `ROADMAP.md`: MVP 8 blocos, V1 7, V2 7, V3 backlog 6. Seis decisões abertas (A-01..A-06) em `APROVACOES.md`.
- 2026-11-22 — Fase 2: `spec.md` escrito (R1–R45 / CA-R1–CA-R45, 9 blocos M-01..M-09), D-002 (centavos inteiros), D-003 (Vite 8 + React 19 + TS 7 + Dexie 4), D-004 (FastAPI na V1), D-005 (item não marcado conta no valor final). Três rodadas de correção do Iago na spec (desfazer 8 s; checkbox sem efeito financeiro; R45 "excluir não marcados"). **Spec aprovada** em 2026-11-22 com a fala "Aprovado" → `.hermes-flow/gates/spec.approved` gravado com sha256 `5867893f…`. Commit `b8384ba` (spec final) e `0b3b5a1`/`7b2fccc` (gate + oráculo).
- 2026-11-22 — Fase 3 (início): `.gitattributes` força LF (o gate usa sha256 do arquivo em disco). Oráculo de aceite escrito a partir dos CA-R antes de qualquer código de produção: 3 arquivos, 41 testes, vermelho confirmado (29/29 falhando no build inicial — 12 testes ficaram invisíveis até o fim porque o fixture do describe chamava o stub), congelado em `.hermes-flow/frozen-tests.txt`. Domínio implementado em `src/dominio/` (dinheiro, lista, item, produto): **41/41 verdes**, `tsc --noEmit` limpo.- 2026-11-22 — Fase 3 (fatias de persistência, UI e restante do MVP): oráculo congelado cresceu para 8 arquivos e **92 testes**. Persistência Dexie v1 + repositório transacional (55/55). Telas `Inicio`, `Listas`, `NovaLista`, `DetalheLista`, `EditarLista`, `ModoCompra`, `Finalizar`, `Ajustes` (82/82). Restante: editar/excluir lista com confirmação, iniciar compra (status `comprando`), cabeçalho duplo no modo compra com item marcado no fim, preço/quantidade editáveis, item rápido "+" já adquirido, detalhe de concluída com marcas, saldo com sinal, autocomplete com último preço, backup JSON exportar/importar (89/89). PWA: `manifest.webmanifest`, ícones PNG gerados por script, `sw.js` com app shell + navegação offline, registro em produção (92/92).
- 2026-11-22 — Fase 4 (QA): suíte reexecutada limpa em `6fdb566` → **92/92 em 28,5 s**, `tsc --noEmit` ok, `npm run build` ok. Aceite executado em navegador real (`vite preview` + Chrome/CDP): lista de `R$ 300,00`, itens 2×24,90 + 4,49 = `R$ 54,29`, modo compra com carrinho `R$ 49,80`, edição de preço 4,49 → 21,50, finalize com `VALOR FINAL R$ 21,50`, gasto do mês conferido. Offline testado com `Network.emulateNetworkConditions offline=true`: app shell abre do service worker, `/listas` e detalhe navegam sem rede. Prova de mutação: quebrar D-005 derrubou **7 testes**. Achados: 3 CAs sem teste nomeado (CA-R5/R19/R29, cobertos em `6fdb566`), commit de preço no blur consertado em `9e6b9d7`, ícones provisórios e iPhone real pendente. `_hermes/REVIEW.md` → **REVIEW: passou**. D-006 registrada (integração em `main`).

## 2026-11-23 — redesign mobile-first (pedido do Iago após validar o MVP)

- Direção em `_hermes/DESIGN_SYSTEM.md`: "recibo de mercado, não planilha"; o número grande é a
  informação. Fonte do sistema (offline-first). Contraste medido: 11 pares, todos ≥ 4.5:1.
- Barra inferior com ícone e rótulo só nas rotas de consulta; telas de tarefa ficam com a ação
  principal fixa no rodapé (Iniciar compra, Finalizar compra).
- Itens em grade de duas linhas; no modo compra o valor parcial fica na linha do nome e os
  campos de edição compactos abaixo.
- Verificado em viewport 390×844 (6 telas fotografadas) e suíte **92/92** verde, `tsc` limpo,
  build ok. Publicado em `https://notebook-server.tail3cd1af.ts.net/`.

## 2026-11-23 — repo público e GitHub Pages

- Repo `iagoAguiar/listo` passou de privado para público, a pedido do Iago.
- Site no ar: `https://iagoaguiar.github.io/listo/` (branch `gh-pages`, build com base `/listo/`).
  Conferido: raiz, JS, CSS, service worker e ícone em HTTP 200; rota `/listas` entrega o app.
- As listas continuam só no IndexedDB do aparelho. Publicar o site não publica os dados.

