# Avaliação de backend — ListO

Escopo: o backend **entra na V1** (contas + sync + dashboard na nuvem). O MVP é local
(Dexie no aparelho, A-03) e não depende desta decisão para começar. Este documento fecha
a escolha do A-05 parte servidor, com o Iago já tendo descartado Supabase.

Versões conferidas nos registros em 2026-11-22.

## Candidatos

| Opção | Versões atuais | Peso |
|---|---|---|
| **FastAPI + SQLAlchemy + Alembic** (Python 3.13) | fastapi 0.165.0 · sqlalchemy 2.1.9 · pydantic 2.14.4 · alembic 1.20.1 · argon2-cffi 25.1.0 · uvicorn 0.54.0 | baixo |
| **Fastify + Zod + Drizzle** (Node/TS) | fastify 5.12.8 · drizzle-orm 0.45.4 · @node-rs/argon2 2.2.2 | baixo |
| **NestJS** (Node/TS) | @nestjs/core 12.6.0 | alto |

## Recomendação: FastAPI + Postgres

1. **É a stack da casa.** `Painel_SDLC` (o próprio harness deste fluxo) é FastAPI 0.115+,
   SQLAlchemy 2, Alembic, Pydantic 2, pytest + httpx, `uv`, `requires-python >=3.13`.
   Reaproveito comandos, layout de projeto, padrão de teste e de migração. Não é reuso de
   código — é reuso de cabeça, e num projeto conduzido por uma cabeça só isso pesa mais que
   qualquer benchmark.
2. **O domínio não pede framework estrutural.** São ~6 recursos (conta, lista, item,
   produto, compra concluída, sessão) com CRUD, auth e três agregações de dashboard.
   FastAPI entrega validação (Pydantic), OpenAPI automático e roteamento sem DI container.
   NestJS resolve organização de time grande com módulos, providers e decorators — para um
   dev só, é cerimônia cobrada em cada arquivo.
3. **Dinheiro em centavos fica à prova de pressa.** `int` no Python, `BIGINT` no Postgres,
   `NUMERIC(12,2)` onde precisar. Em TS a marca `type Centavos` é apagada em runtime: nada
   impede um `number` cru de entrar. Em Python o custo de errar é maior e o teste estático
   pega mais fácil.
4. **O que eu perderia de Node (tipos compartilhados) se recupera.** FastAPI gera OpenAPI;
   `openapi-typescript` gera os tipos do front a partir dele. O contrato fica único e
   verificado na CI — sem duplicar schema Zod na mão.
5. **Teste já é padrão conhecido:** pytest + httpx (ou TestClient) para API, Playwright para
   o E2E que já existe no front. Em Node seria vitest + fastify inject — bom, mas é uma
   segunda stack de teste para manter além da do front.

## Quando a resposta mudaria

- **Colaboração em tempo real na mesma lista (V3-01)** virasse prioridade: aí NestJS +
  WebSocket/SSE com estrutura de módulos passa a valer o peso.
- O Iago passasse a escrever/revisar backend no dia a dia em TypeScript: aí a stack única
  (Fastify + Zod, **não** Nest) venceria por manutenção humana, não por técnica.

Nenhuma das duas vale hoje.

## Como ficaria

```
ListO/
├── web/            # Vite + React + TS (MVP inteiro)
├── api/            # FastAPI (V1): routers, models, schemas, services
│   ├── routers/    # auth, listas, itens, dashboard, sync
│   ├── models/     # SQLAlchemy 2
│   ├── schemas/    # Pydantic (centavos: int)
│   └── migrations/ # Alembic
├── tests/          # pytest (API) + Playwright (E2E)
└── compose.yaml    # Postgres 16 + api + web (Caddy)
```

- Banco: **Postgres 16** em Docker (o host já tem Docker). SQLite só se o deploy virar
  single-user — o que contraria o propósito da V1.
- Auth: e-mail + senha com `argon2-cffi`, sessão por token opaco em cookie `HttpOnly`
  (`SameSite=Lax`), sem JWT no cliente. Recuperação de senha por token de uso único.
- Sync: `POST /sync/push` com lote de operações e `POST /sync/pull?since=` por `updated_at`;
  conflito = última escrita vence, com aviso na UI (V1-02).

## Custo

Moderado na V1 (auth + sync + migração dos dados locais é a fatia maior de backend).
Zero no MVP.