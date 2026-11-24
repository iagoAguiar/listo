# BOARD — ListO

**Fase:** lista aberta simplificada (2026-11-23) — MVP entregue, `REVIEW: passou` no SHA `6fdb566`
**Repo:** `github.com/iagoAguiar/listo` (público) · site `https://iagoaguiar.github.io/listo/`
**Gate:** **aberto.** `.hermes-flow/gates/spec.approved` com `sha256 5867893f…`
e a fala "Aprovado" (Iago, 2026-11-22).

## Estado

- Spec: **R1–R45 / CA-R1–CA-R45**, 9 blocos (M-01..M-09). Aprovada.
- Stack: Vite 8.3.8 + React 19.3.1 + TS 7.0.2 + Dexie 4.4.7 + Zustand 5.1.0 + Zod 4.6.7
  + Vitest 5.1.1 (D-003). Backend da V1: FastAPI (D-004, fora do MVP).
- Oráculo congelado: 6 arquivos em `.hermes-flow/frozen-tests.txt`
  (`dinheiro`, `lista`, `itens`, `persistencia`, `telas`/`compra`, `restante`, `entrega`,
  `cobertura`) — **92 testes, 92 verdes**, `tsc --noEmit` limpo, `npm run build` ok.
- Revisão: `_hermes/REVIEW.md` → **REVIEW: passou** (SHA `6fdb566`), com prova de mutação
  (7 testes vermelhos ao quebrar D-005) e aceite executado em navegador real, inclusive offline.

## Progresso do MVP

- M-01 dados (IndexedDB `listo` v1): 100% — schema Dexie + repositório transacional
- M-02 CRUD lista: 100% — criar, listar, editar, excluir com confirmação
- M-03 itens + catálogo: 100% — CRUD, autocomplete com último preço, catálogo sem duplicata
- M-04 totais em tempo real: 100% — estimado, saldo com sinal, valor final (D-005)
- M-05 Modo Compra: 100% — totais no cabeçalho, marcar, ordem, editar preço/quantidade, "+"
- M-06 finalizar + resumo: 100% — resumo, excluir não marcados, status/data de conclusão
- M-07 início: 100% — gasto do mês pela data de conclusão + últimas 5 compras
- M-08 PWA offline: 95% — manifesto, ícones, service worker e tela de ajustes/backup;
  falta só o teste em iPhone real
- M-09 bordas: 100% — máscara, quantidade até 3 casas, concluída read-only, tetos de valor
- **Total de código do app: 100% do MVP** (~9 arquivos de domínio/dados, 9 telas, 92 testes)

## Pendências

1. **Teste em iPhone real** (M-08): abrir `dist` no Safari do Iago, instalar na tela inicial,
   desligar a rede e reabrir. Único item que a máquina não consegue provar sozinha.
2. Ícones provisórios (`scripts/gerar-icones.cjs`) — trocar quando houver logo.
3. V1 (conta + sync): fora do MVP, já com `AVALIACAO-BACKEND.md` e D-004 registradas.

## Próximo

1. Publicar o MVP (`dist`) num host estático (decisão do Iago: onde).
2. Abrir o `ROADMAP.md` na V1 e fatiar: auth por token opaco, Postgres, `/sync/push` e `/sync/pull`.
