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