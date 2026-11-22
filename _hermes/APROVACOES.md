# Aprovações pendentes — ListO

| # | Decisão | Recomendo | Custo se mudar depois | Status |
|---|---|---|---|---|
| A-01 | Recorte de escopo MVP / V1 / V2 / V3 (8 + 7 + 7 blocos) | aprovar como está | alto | ✅ aprovado 2026-11-22 |
| A-02 | MVP **sem login** (conta só na V1) | sim, sem login | baixo | ✅ aprovado 2026-11-22 |
| A-03 | Dado do MVP **local no aparelho** (offline de verdade) | local-first | médio | ✅ aprovado 2026-11-22 |
| A-04 | Cortar **CPF, endereço, cidade/estado e celular** do cadastro | cortar | baixo | ✅ aprovado 2026-11-22 |
| A-06 | Renumerar RF duplicados (006/007) e padronizar o nome **ListO** no doc | sim | baixo | ✅ aprovado 2026-11-22 |
| A-05 | Stack técnica (detalhada em D-003) | Vite + React 19 + TS strict + Dexie + Zustand + Tailwind + Vitest/Playwright + PWA | alto depois de 1 fatia | ✅ aprovado 2026-11-22 |
| A-05b | Backend da V1 (detalhado em D-004) | FastAPI + Postgres (Supabase descartado pelo Iago) | alto depois de 1 fatia | ✅ aprovado 2026-11-22 |
| A-07 | Aprovar `_hermes/spec.md` do MVP (R1–R44 / CA-R1–CA-R44) | aprovar | alto | ⏳ aguardando |

Falas literais do Iago em 2026-11-22:
- "Ok todo o restante está aprovado, mas qual stack escolhida?" → A-01, A-02, A-03, A-04, A-06.
- "Ok, mas o backend não quero via Supabase, podemos ir de FastAPI ou Node, ou Nestjs…" → A-05 (front).
- "ok aceito ser feito em FastAPI" → A-05b (backend).

Enquanto A-07 estiver aberta, não escrevo teste de aceite nem código — sem
`.hermes-flow/gates/spec.approved` o hook bloqueia.