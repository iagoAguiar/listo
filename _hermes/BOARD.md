# BOARD — ListO

**Fase:** 2 (spec) — spec do MVP escrita, aguardando gate do Iago
**Repo:** `github.com/iagoAguiar/listo` (privado) · branch `main`
**Gate:** fechado. `spec.md` existe (sem `.hermes-flow/gates/spec.approved`).

## Estado

- Escopo e stack aprovados (A-01..A-06). Front em D-003, backend da V1 em D-004.
- `_hermes/spec.md` escrito: 44 requisitos (R1–R44) em 9 blocos (M-01..M-09) e 44 critérios
  de aceite (CA-R1..CA-R44), mais modelo de dados, telas, fora de escopo e 5 riscos.
- `AVALIACAO-BACKEND.md` registra a comparação FastAPI × Fastify × Nest.

## Próximo

1. Iago aprova a spec (A-07) → gravo `.hermes-flow/gates/spec.approved` com sha256 e a fala.
2. Escrevo `tests/` de aceite a partir dos CA-R, vejo vermelho, congelo em
   `.hermes-flow/frozen-tests.txt` e commito.
3. Build fatia por fatia (M-01 → M-09), commit atômico por fatia.