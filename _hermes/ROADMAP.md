# ROADMAP — ListO

Derivado de `docs/base/ListO-base.md` (923 linhas, sha256 `7a86225e…0ff1ae5`).
Este arquivo **não é a spec**: é o recorte de escopo que o Iago aprova antes de eu
escrever requisito numerado e critério de aceite.

Regra do recorte: cada fase só entra se **fecha um ciclo de uso completo**. Fase que
entrega metade do ciclo (ex: dashboard sem compra finalizada para alimentar) não existe.

---

## MVP — "a lista que funciona no corredor do mercado"

**Prova:** o app sozinho, num celular, cria a lista com orçamento, acompanha a compra no
mercado e fecha a compra com valor real. Sem conta, sem nuvem, sem login.

| ID | Bloco | O que entrega |
|---|---|---|
| M-01 | Fundação de dados | Modelo `Lista` / `Item` / `Produto`. Dinheiro em **centavos inteiros**. Migração v1 do esquema local. |
| M-02 | CRUD de listas (RF-005) | Nome, data, tipo (`Mensal`/`Semanal`/`Esporádica`), orçamento, supermercado opcional, forma de pagamento. Criar, editar, excluir com confirmação. |
| M-03 | Itens na lista (RF-006) | Adicionar item com nome, quantidade e preço estimado; editar e remover. Autocomplete do catálogo pessoal. Item sugerido com o último preço pago. |
| M-04 | Totais em tempo real (RF-008) | Valor parcial = qtd × preço; total estimado; saldo = orçamento − total. Recalcula na hora, sem ida ao servidor. Cor muda quando estoura. |
| M-05 | Modo Compra (RF-007) | Checkbox por item, `Total Estimado` × `Total no Carrinho`, ajuste rápido de preço/qtd, item não planejado com opção "salvar no catálogo", item marcado vai para o fim e fica riscado. |
| M-06 | Finalizar compra (RF-007) | Resumo (final vs orçamento), status `Concluída`, valor final congelado, data efetiva da compra. |
| M-07 | Resumo do mês (versão mínima de RF-009) | Total gasto no mês corrente + últimas compras finalizadas com link para detalhe read-only. **Sem gráfico.** |
| M-08 | Offline e persistência | Dados locais no aparelho, funciona sem rede, instala como PWA na tela inicial. |

**Sai do MVP:** onboarding em carrossel (RF-000), cadastro (RF-001), login (RF-002),
login por código (RF-003), recuperação de senha (RF-004), CPF, endereço, e-mail,
gráficos, comparação de períodos, compartilhamento.

**Critério de saída do MVP:** em um celular real, criar "Compras do mês" com orçamento de
R$ 400, cadastrar 10 itens, abrir Modo Compra, marcar 6, ajustar 1 preço, adicionar 1 item
fora da lista, finalizar, e ver R$ X como gasto do mês no resumo. Tudo sem login e sem rede.

---

## V1 — "na nuvem, com conta, e para mais de um aparelho"

**Prova:** o dado não morre com o celular, o app aceita mais de uma pessoa, e o gasto
vira análise de verdade.

| ID | Bloco | O que entrega |
|---|---|---|
| V1-01 | Conta (RF-001/002) | Cadastro com nome, e-mail, senha e aceite dos termos. Login, sessão, logout. Senha com hash. **Sem CPF, sem endereço, sem cidade/estado.** |
| V1-02 | Sync por usuário | Dados na nuvem por conta, dois aparelhos veem a mesma lista. Conflito de edição resolvido por `updated_at` (última escrita vence, com aviso). |
| V1-03 | Adoção dos dados do MVP | Primeiro login oferece importar as listas que já estão no aparelho. |
| V1-04 | Recuperação de senha (RF-004) | Link por e-mail transacional, token de uso único, 60 min, mensagem neutra que não revela se o e-mail existe. |
| V1-05 | Onboarding (RF-000) | 3 telas, "Pular", flag local de "já viu". Só aparece para quem não está logado. |
| V1-06 | Dashboard v1 (RF-009 §2–4) | Filtro `Este mês`/`Mês passado`/`Este ano`, card de total, card de comparação com o período anterior, últimas compras. Estado vazio com CTA. |
| V1-07 | Detalhe da compra | Tela read-only de uma compra concluída, aberta pelo dashboard e pela lista. |

**Critério de saída da V1:** criar conta no celular A, montar e finalizar uma compra,
abrir no celular B logado na mesma conta e ver a compra e o total do mês.

---

## V2 — "inteligência e conveniência"

**Prova:** o app passa a trabalhar a favor do usuário em vez de só registrar.

| ID | Bloco | O que entrega |
|---|---|---|
| V2-01 | Login por código (RF-003) | Código de 6 dígitos por e-mail, expira em 10 min, uso único, reenvio com contagem de 60 s. |
| V2-02 | Gráficos (RF-009 §4) | Barras dos últimos 6 meses, pizza/donut por tipo de compra, tooltip com valor exato. |
| V2-03 | Histórico de preço | Preço médio e último preço por produto; sugestão automática ao adicionar item; alerta quando o preço subiu acima de X%. |
| V2-04 | Repetir compra | Duplicar lista (itens + quantidades) e "repetir compra do mês passado". |
| V2-05 | Orçamento mensal global | Um teto do mês somando todas as listas concluídas, com barra de progresso — herança direta do `Lista_de_Compras`. |
| V2-06 | Busca e filtros | Buscar lista e produto; filtrar listas por tipo, status e período. |
| V2-07 | PWA madura | Ícone, splash, fila de escrita offline com sync ao voltar a rede. |

---

## V3 — backlog (nada disso entra sem pedido explícito)

| ID | Item | Nota |
|---|---|---|
| V3-01 | Compartilhar lista / compra em família | Maior valor de retenção, maior custo: colaboração em tempo real e permissão. Doc base põe fora do 1.0. |
| V3-02 | Leitura de código de barras | Depende de catálogo externo (EAN/TACO) para virar preço. |
| V3-03 | Comparação de preços entre mercados | Precisa base de preço de terceiros; sem isso vira formulário vazio. |
| V3-04 | Rede social de preços (estilo Waze) | Efeito de rede: só faz sentido com base de usuários. |
| V3-05 | Integração com e-commerce | Cesta → lista. Depende de parceria/API. |
| V3-06 | Sugestão por histórico | "Você compra leite a cada 15 dias" — depois da V2-03 existir. |

---

## Mapa RF do documento → fase

| RF do doc | Fase |
|---|---|
| RF-000 onboarding | V1-05 |
| RF-001 cadastro | V1-01 |
| RF-002 login | V1-01 |
| RF-003 login por código | V2-01 |
| RF-004 recuperar senha | V1-04 |
| RF-005 criar/gerenciar lista | M-02 |
| RF-006 produtos na lista | M-03 |
| RF-007 modo compra | M-05 + M-06 |
| RF-008 cálculo do orçamento | M-04 |
| RF-009 dashboard | M-07 (mínimo) → V1-06 → V2-02 |

---

## Pendências do documento base (preciso da tua palavra)

1. **Numeração repetida.** RF-006 aparece como "Cadastro de Produtos" (§2.2) e como
   "Adicionar/Gerenciar Produtos na Lista" (módulo detalhado). RF-007 aparece como
   "Adicionar Produto à Lista" e como "Uso da Lista em Modo de Compra". São duas
   funcionalidades diferentes com o mesmo ID. **Proponho renumerar** para
   RF-006 = produtos/catálogo, RF-007 = itens na lista, RF-010 = modo compra.
2. **Nome trocado.** O documento fala "Plano de Compra" em ~15 lugares (títulos, e-mails,
   títulos de tela). O produto é **ListO**. Proponho padronizar em ListO.
3. **CPF obrigatório no cadastro.** Custo alto (validação de dígito, unicidade, dado
   sensível sob LGPD) e nenhum valor para o produto. **Proponho cortar.**
4. **Endereço, cidade/estado e celular obrigatórios.** Nada no MVP/V1 usa esses dados.
   **Proponho cortar** e trazer de volta só se houver entrega.
5. **E-mail transacional.** RF-003 e RF-004 dependem de provedor (SES/SendGrid/Mailgun).
   Isso é conta, chave e custo — entra na V1-04, não antes.
6. **Link quebrado no texto do erro.** A mensagem "Este e-mail já está em uso. Tente fazer
   login" aponta para uma busca do Google em vez de `/login` (linha 260 do doc).

---

## Divisão de esforço estimada (fatias, não dias)

| Fase | Blocos | Peso |
|---|---|---|
| MVP | 8 | ~40% do trabalho total |
| V1 | 7 | ~30% |
| V2 | 7 | ~25% |
| V3 | 6 | backlog, não estimado |

O MVP é a fatia maior porque carrega fundação, modelo de dados, Modo Compra e offline —
o resto reaproveita. Nenhum bloco da V1 ou V2 é pré-requisito do MVP.