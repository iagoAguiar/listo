# AGENTS.md — ListO

Regras para o agente que trabalha neste repo (perfil `sdlc-solo`, fluxo v5).

## Regra de ouro

Este repo está sob o hook `flow_gate.py`: com `.hermes-flow/` presente, **escrita em
código só passa com `_hermes/spec.md` aprovado** (`.hermes-flow/gates/spec.approved`
com o sha256 atual do spec). Sem gate válido, pare e peça aprovação ao Iago.

## Fluxo

1. `_hermes/intent.md` — o pedido nas palavras do Iago.
2. `_hermes/spec.md` — requisitos numerados + critério de aceite testável → gate do Iago.
3. `_hermes/plan.md` — fatias na ordem, e o que NÃO fazer.
4. Testes de aceite escritos **antes** do código, vem vermelho, entram em
   `.hermes-flow/frozen-tests.txt` e são commitados.
5. Build por fatia, commit atômico, teste verde.
6. `_hermes/REVIEW.md` com `REVIEW: passou|falhou`.
7. Merge e registro em `_hermes/HISTORICO.md`.

## Stack

A definir na fase 1. Quando definida, este arquivo passa a listar os comandos
exatos de instalar, rodar e testar — e nada além disso é aceito como evidência.

## Commits

Um assunto por commit, mensagem no imperativo, escopo entre parênteses quando ajuda
(`feat(api): ...`, `test(aceite): ...`, `docs(hermes): ...`). Nunca commitar `.env`,
`.venv`, `node_modules`, banco local ou segredo.

## Proibido

`git push --force`, `git reset --hard`, `rm -rf`, DDL destrutivo, editar teste
congelado, editar artefato aprovado, criar gate sem fala literal do Iago.