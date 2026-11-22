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
| A-07 | Aprovar `_hermes/spec.md` do MVP (R1–R45 / CA-R1–CA-R45) | aprovar | alto | ⏳ aguardando fala final |

Respostas do Iago aos 5 pontos da spec (2026-11-22): "1- Sim, mas aumente para 8s / 2- Sim. /
3- Não, ele deve sempre contabilizar, só não contabiliza se for excluido. / 4- Sim. / 5- Sim."
Aplicado: R13 e CA-R13 com desfazer de **8 s**; R27/R28/R30 e CAs reescritos para o valor final
somar **todos** os itens; R18 marcado como informativo; **R45/CA-R45 novos** ("Excluir não
marcados" no resumo); risco 6 registrado. ADR em `D-005`.

Falta a fala literal aprovando o artefato `spec.md` como está — sem ela não gravo
`.hermes-flow/gates/spec.approved` e o hook continua bloqueando código.