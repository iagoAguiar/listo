# Decisões — ListO

ADRs curtos, numerados `D-NNN`, mais recentes no fim.

## D-001 — Projeto novo entra no fluxo v5 com gate ativo

**Data:** 2026-11-22
**Contexto:** nenhum projeto existente em `Desktop/projetos` tem `.hermes-flow/`; todos são legado multi-agente (v3/v4), onde o hook `flow_gate.py` fica inerte.
**Decisão:** o ListO nasce com `.hermes-flow/` desde o primeiro commit, para que spec aprovada, oráculo congelado e bloqueio de escrita em código valham desde a fatia 1.
**Consequência:** escrever código antes de `spec.approved` é bloqueado pelo hook, não por disciplina.