# BOARD — ListO

**Fase:** 3 (build) — fatia de domínio fechada, próxima fatia é persistência + telas
**Repo:** `github.com/iagoAguiar/listo` (privado) · branch `main`
**Gate:** **aberto.** `.hermes-flow/gates/spec.approved` gravado com `sha256 5867893f…`
e a fala "Aprovado" (Iago, 2026-11-22).

## Estado

- Spec: **R1–R45 / CA-R1–CA-R45**, 9 blocos (M-01..M-09). Aprovada.
- Stack: Vite 8.3.8 + React 19.3.1 + TS 7.0.2 + Dexie 4.4.7 + Zustand 5.1.0 + Zod 4.6.7
  + Vitest 5.1.1 (D-003). Backend da V1: FastAPI (D-004, fora do MVP).
- Oráculo congelado: `tests/aceite/{dinheiro,lista,itens}.test.ts` — **41 testes, 41 verdes**,
  listados em `.hermes-flow/frozen-tests.txt`. `tsc --noEmit` limpo.
- Domínio pronto em `src/dominio/`: `dinheiro.ts` (centavos, half-up, R15/R17/R38/R39),
  `lista.ts` (validação, totais, saldo, valor final D-005), `item.ts` (validação, normalização),
  `produto.ts` (catálogo sem duplicata, sugestões R10/R11/R14).

## Progresso do MVP

- M-01 dados (IndexedDB `listo` v1): 0% — só o domínio existe, nenhum schema Dexie ainda
- M-02 CRUD lista: 25% — validação pronta, sem persistência/tela
- M-03 itens + catálogo: 40% — regra pronta, sem tela/autocomplete
- M-04 totais em tempo real: 35% — cálculo pronto, sem UI
- M-05 Modo Compra: 0%
- M-06 finalizar + resumo: 0%
- M-07 início (total do mês, últimas 5): 0%
- M-08 PWA offline: 0%
- M-09 bordas: 30% — máscara de dinheiro e quantidade (R38/R39) prontas
- **Total de código do app: ~20%**

## Próximo

1. M-01: schema Dexie (`listas`, `itens`, `produtos`) + repositório testável.
2. M-02/M-03: telas de lista e item (React) com o teste de aceite de UI escrito antes.
3. M-04/M-05: cabeçalho de totais e Modo Compra (alvo de toque ≥ 44px, dois totais).
