# Decisões — ListO

ADRs curtos, numerados `D-NNN`, mais recentes no fim.

## D-001 — Projeto novo entra no fluxo v5 com gate ativo

**Data:** 2026-11-22
**Contexto:** nenhum projeto existente em `Desktop/projetos` tem `.hermes-flow/`; todos são legado multi-agente (v3/v4), onde o hook `flow_gate.py` fica inerte.
**Decisão:** o ListO nasce com `.hermes-flow/` desde o primeiro commit, para que spec aprovada, oráculo congelado e bloqueio de escrita em código valham desde a fatia 1.
**Consequência:** escrever código antes de `spec.approved` é bloqueado pelo hook, não por disciplina.

## D-002 — Dinheiro em inteiro de centavos, quantidade em milésimos

**Data:** 2026-11-22
**Contexto:** preço, quantidade e total são o núcleo do ListO. `float` (IEEE-754 double) não
representa decimais exatos: `10 × 0,10` dá `0.9999999999999999`, `round(2.675, 2)` dá `2.67`,
e o saldo exibido vira `-17.060000000000002`.
**Decisão:** persistir e calcular `preco_centavos` como inteiro; `quantidade_milesimos`
como inteiro (1,5 kg = 1500); `parcial_centavos = round(qtd_milesimos * preco_centavos / 1000)`
com regra half-up, aplicada **uma vez por item**. Conversão para reais só na borda de
exibição, com `Intl.NumberFormat('pt-BR')`. Proibido `float`/`number` para dinheiro em
modelo, API, banco e store.
**Consequência:** comparação de orçamento é exata; total do dashboard e total da lista
fecham no mesmo centavo independente da ordem de soma; nenhum `0.30000000000000004` vaza
para a tela.

## D-003 — Stack do app: Vite + React + TypeScript + Dexie + Zustand + Tailwind

**Data:** 2026-11-22 · **Aprovação:** A-05 ("Ok, mas o backend não quero via Supabase…")
**Contexto:** o app é PWA mobile-first, offline-first, com estado local rico (lista, itens,
carrinho) e dinheiro em centavos. Precedente no disco: `Lista_de_Compras` (Vite + MD3 + PWA).
**Decisão:** `vite` 8 + `react` 19 + `typescript` 7 `strict`; dados em IndexedDB via `dexie` 4
com esquema versionado; estado de tela com `zustand` 5; CSS com `tailwindcss` 4 + tokens do
design system (a fechar na fase de design); validação com `zod` 4; testes com `vitest` 5 +
Testing Library e `@playwright/test` 1.65 (viewport de celular) para os fluxos de aceite;
PWA com Workbox.
**Consequência:** sem SSR (não serve app offline-first) e sem kit de UI genérico. TypeScript
`strict` é o que sustenta o D-002: `type Centavos` no código inteiro + teste estático que
reprova dinheiro como `number` solto.

## D-004 — Backend da V1: FastAPI + Postgres

**Data:** 2026-11-22 · **Aprovação:** A-05 ("ok aceito ser feito em FastAPI")
**Contexto:** Supabase descartado pelo Iago. Candidatos avaliados em `AVALIACAO-BACKEND.md`
(FastAPI, Fastify+Zod, NestJS). O domínio é pequeno (~6 recursos, CRUD + auth + 3 agregações)
e a casa já roda FastAPI no `Painel_SDLC`.
**Decisão:** FastAPI 0.165 + SQLAlchemy 2.1 + Alembic 1.20 + Pydantic 2.14 + `argon2-cffi`,
servido por uvicorn 0.54; Postgres 16 em Docker; pytest + httpx para API e Playwright para E2E.
Sessão por token opaco em cookie `HttpOnly` (sem JWT no cliente). Sync por
`POST /sync/push` + `GET /sync/pull?since=`, conflito resolvido por `updated_at`.
**Consequência:** backend entra só na V1 — o MVP não depende dele. NestJS fica reservado para
o cenário de colaboração em tempo real (V3-01) com time maior. Tipos do front vêm do OpenAPI
via `openapi-typescript`.

## D-005 — Item não marcado conta no valor final; só sai se excluído

**Data:** 2026-11-22 · **Aprovação:** Iago, fala literal: "Não, ele deve sempre contabilizar,
só não contabiliza se for excluido."
**Contexto:** no resumo de finalização, o doc base deixava o "Total no Carrinho" (itens
marcados) virar o valor gravado, e itens não marcados ficavam fora do gasto.
**Decisão:** `valor_final_centavos` é a soma dos parciais de **todos** os itens da lista,
marcados ou não. O checkbox passa a medir progresso, não dinheiro: `total_carrinho_centavos`
vira informativo. Para tirar um item do gasto, o caminho é excluir — pelo item (R13, desfazer
de 8 s) ou pela ação em lote "Excluir não marcados" no resumo (R45, nova).
**Consequência:** o gasto do mês reflete a lista inteira, não o que foi riscado no corredor.
Risco de leitura errada pelo usuário → o resumo escancara "X marcados / Y não marcados" e
oferece a exclusão em lote.