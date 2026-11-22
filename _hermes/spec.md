# Spec: ListO · MVP v1

Origem: `intent.md` (sha `2c36ed9d18d3`) · Doc base: `docs/base/ListO-base.md` (sha `7a86225e9d8e`)
Data: 2026-11-22 · Autor: UncleBob (`sdlc-solo`)
Escopo aprovado: A-01 em 2026-11-22 · Stack: A-05 aprovado (`D-003`, `D-004`)

## Objetivo

Um app de lista de compras com orçamento que funciona sozinho no celular, sem conta e sem
rede: monta a lista com preço estimado, mostra o total antes da compra, acompanha o carrinho
item a item no mercado e fecha a compra com o valor real, somando no gasto do mês.

## Requisitos

### M-01 · Fundação de dados

R1. Todo dado do app persiste em IndexedDB (banco `listo`, versão 1), com tabelas `listas`,
`itens` e `produtos`. Fechar e reabrir o app preserva tudo.
R2. Todo valor monetário é inteiro de centavos (`preco_centavos`, `orcamento_centavos`,
`total_centavos`) em modelo, store, cálculo e exibição. Quantidade é inteiro de milésimos.
R3. Primeira abertura, sem dados, mostra estado vazio com CTA — nunca tela de erro.

### M-02 · Listas

R4. Criar lista exige `nome` (1–60 caracteres) e `orcamento_centavos` > 0. `data` assume hoje,
`tipo` assume `mensal`, `forma_pagamento` é obrigatória, `mercado` é opcional.
R5. Lista criada nasce com status `planejamento` e abre direto na tela de detalhe.
R6. Editar lista altera seus campos e preserva os itens já adicionados.
R7. Excluir lista exige confirmação explícita e remove a lista e todos os seus itens.
R8. A tela de listas mostra cards com nome, data, status e valor (estimado em `planejamento`
e `comprando`; final em `concluida`), ordenados por data decrescente.

### M-03 · Itens e catálogo

R9. Adicionar item exige `nome` (1–80 caracteres), `quantidade_milesimos` > 0 e
`preco_unitario_centavos` ≥ 0.
R10. Ao digitar o nome do item, o app sugere até 5 produtos do catálogo cujo nome normalizado
(sem acento, caixa baixa) contém o texto digitado, com o preço sugerido ao lado.
R11. Escolher produto da sugestão preenche o preço com o `ultimo_preco_centavos`; se não
houver, usa `preco_padrao_centavos`.
R12. Editar quantidade ou preço de um item recalcula seu parcial e os totais da lista na hora.
R13. Remover item é imediato e oferece "Desfazer" por 5 segundos.
R14. Todo item gravado alimenta o catálogo: cria o produto se não existir (match por nome
normalizado) e atualiza `ultimo_preco_centavos`; nome repetido não duplica registro.

### M-04 · Cálculos

R15. `parcial_centavos = round_half_up(quantidade_milesimos × preco_unitario_centavos / 1000)`,
arredondado uma única vez por item.
R16. `total_estimado_centavos` = soma dos parciais de todos os itens da lista.
R17. `saldo_centavos` = `orcamento_centavos` − `total_estimado_centavos`, exibido com sinal
("R$ 25,50 abaixo do orçamento" / "R$ 25,50 acima do orçamento") e cor de alerta quando negativo.
R18. `total_carrinho_centavos` = soma dos parciais apenas dos itens com `adquirido = true`.
R19. Todo total é recalculado no mesmo ciclo da ação que o alterou, sem recarregar a tela e
sem chamada de rede.

### M-05 · Modo Compra

R20. "Iniciar compra" muda o status para `comprando` e abre a tela de modo compra com fonte de
corpo ≥ 18px e alvo de toque ≥ 44×44px.
R21. Tocar num item alterna `adquirido`; item adquirido fica riscado e ao fim do grupo, e a
ordem entre os demais não muda.
R22. Cabeçalho fixo exibe `Total estimado` e `Total no carrinho` ao mesmo tempo, atualizados a
cada marcação.
R23. Preço e quantidade continuam editáveis no modo compra, com o mesmo resultado do detalhe.
R24. Botão "+" abre formulário rápido com `nome`, `preço`, `quantidade` e o checkbox "Salvar
este produto no meu catálogo", marcado por padrão.
R25. Item adicionado no modo compra entra já como `adquirido = true` e soma no total do carrinho.
R26. O modo compra funciona com a rede desligada, inclusive marcar, editar, adicionar e finalizar.

### M-06 · Finalizar compra

R27. Finalizar abre resumo com: valor final, orçamento, diferença (acima/abaixo), número de
itens no carrinho e aviso com a quantidade de itens não marcados.
R28. Confirmar grava `valor_final_centavos = total_carrinho_centavos`, status `concluida` e
`data_conclusao` = hoje; a lista passa a ser somente leitura.
R29. Voltar do resumo sem confirmar retorna ao modo compra sem alterar nada.
R30. Itens não marcados permanecem registrados no histórico e não somam no valor final.

### M-07 · Início e histórico

R31. A tela inicial exibe o total gasto no mês corrente: soma de `valor_final_centavos` das
listas `concluida` com `data_conclusao` no mês corrente.
R32. A tela inicial lista as 5 compras concluídas mais recentes com nome, data e valor final.
R33. Sem nenhuma compra concluída, a tela inicial mostra o estado vazio com
"Criar primeira lista".
R34. O detalhe de uma lista concluída é somente leitura e mostra nome, data, valor final,
orçamento e os itens com quantidade, preço, parcial e marca de adquirido.

### M-08 · Offline, instalação e backup

R35. O app é instalável como PWA: manifesto com nome, ícones 192 e 512, `display: standalone`
e `theme_color`.
R36. Após a primeira carga, o app shell abre com a rede desligada e sem mensagem de erro.
R37. Nenhuma tela depende de rede em nenhum momento do MVP.

### M-09 · Validação de borda

R38. Entrada de dinheiro aceita `19,99`, `19.99` e `1.999,99`; rejeita negativo e valor acima
de `1.000.000,00`.
R39. Quantidade aceita até 3 casas decimais, rejeita zero e negativo, máximo `9999,999`.
R40. Lista com status `concluida` bloqueia criação, edição e remoção de itens, com aviso claro.
R41. Nome de lista repetido é permitido (não é chave).
R42. Orçamento `0` é inválido; não existe orçamento "ilimitado" no MVP.
R43. O app oferece "Exportar backup" gerando um JSON com listas, itens e produtos.
R44. O app oferece "Importar backup": valida o JSON e acrescenta as listas com identificadores
novos, sem sobrescrever o que já existe.

## Critério de aceite

CA-R1: dado o app aberto com listas cadastradas, quando recarrego a página, então as listas
voltam com os mesmos itens, preços e quantidades.
CA-R2: dado item de 3 × R$ 19,99, quando o parcial é calculado e gravado, então todo valor
persistido é inteiro (5997) e nenhum campo monetário é float.
CA-R3: dado banco vazio, quando abro o app, então vejo o estado vazio com o botão de criar
lista, sem erro no console.
CA-R4: dado o formulário de nova lista, quando envio sem nome ou com orçamento R$ 0,00, então
vejo a mensagem de campo inválido e nenhuma lista é criada.
CA-R5: dado formulário válido, quando salvo, então a lista aparece com status `planejamento` e
a tela de detalhe abre com o total R$ 0,00.
CA-R6: dado lista com 3 itens, quando altero o orçamento, então os 3 itens continuam lá e o
saldo reflete o novo orçamento.
CA-R7: dado lista qualquer, quando confirmo a exclusão, então a lista e seus itens somem da
tela e do banco.
CA-R8: dado 3 listas (uma concluída), quando abro a tela de listas, então cada card mostra
nome, data, status e o valor correto (final na concluída), em ordem de data decrescente.
CA-R9: dado o campo de item, quando informo quantidade 0 ou preço negativo, então o item não é
adicionado e a mensagem aponta o campo.
CA-R10: dado o catálogo com "Leite Integral", quando digito "leite", então vejo "Leite
Integral" com seu preço na lista de sugestões.
CA-R11: dado produto com último preço R$ 7,49, quando escolho a sugestão, então o preço do item
vem preenchido com 749.
CA-R12: dado item de 2 × R$ 10,00, quando mudo a quantidade para 3, então o parcial vira
R$ 30,00 e o total da lista se atualiza na mesma ação.
CA-R13: dado um item removido, quando clico em "Desfazer" em até 5 s, então o item volta com
quantidade e preço originais.
CA-R14: dado dois itens com o nome "Arroz 5kg", quando o segundo é salvo, então existe um único
produto no catálogo com o último preço atualizado.
CA-R15: dado item de 0,750 kg a R$ 39,90/kg, quando calculo o parcial, então o resultado é
2993 centavos (R$ 29,93).
CA-R16: dado lista com parciais 14000 e 5000, quando abro o detalhe, então o total estimado é
R$ 190,00.
CA-R17: dado orçamento de R$ 200,00 e total de R$ 190,00, quando abro o detalhe, então leio
"R$ 10,00 abaixo do orçamento"; com total R$ 210,00, leio "acima" e o valor fica em alerta.
CA-R18: dado 3 itens marcados somando R$ 87,40, quando entro no modo compra, então o total no
carrinho é R$ 87,40.
CA-R19: dado qualquer alteração de item, quando ela ocorre, então os totais na tela já exibem o
novo valor sem recarregar e sem requisição de rede.
CA-R20: dado lista em `planejamento`, quando clico em "Iniciar compra", então o status muda
para `comprando` e a tela de compra abre com toques medindo ao menos 44×44 px.
CA-R21: dado item não marcado, quando toco nele, então ele fica riscado, vai para o fim e o
total no carrinho aumenta no valor do seu parcial.
CA-R22: dado o modo compra, quando marco e desmarco itens, então "Total estimado" e "Total no
carrinho" aparecem juntos e atualizam a cada toque.
CA-R23: dado modo compra, quando altero o preço de um item marcado, então o total no carrinho
muda na mesma ação.
CA-R24: dado o botão "+", quando preencho nome, preço e quantidade, então o item entra na
lista e o checkbox de catálogo está marcado por padrão.
CA-R25: dado o formulário rápido preenchido, quando confirmo, então o item aparece marcado e
somado ao total no carrinho.
CA-R26: dado o app com a rede desligada, quando percorro modo compra e finalizo, então todas as
ações funcionam e aparecem no histórico.
CA-R27: dado carrinho com R$ 150,00 e orçamento de R$ 200,00, quando clico em finalizar, então
vejo valor final R$ 150,00, diferença R$ 50,00 abaixo e a contagem de itens não marcados.
CA-R28: dado o resumo de finalização, quando confirmo, então a lista fica `concluida` com
valor final gravado e a edição de itens passa a ser bloqueada.
CA-R29: dado o resumo de finalização, quando volto, então o status continua `comprando` e os
totais seguem iguais.
CA-R30: dado item não marcado ao finalizar, quando abro o detalhe da compra, então o item
aparece registrado como não adquirido e fora do valor final.
CA-R31: dado compras concluídas em meses diferentes, quando abro o início, então o total
mostrado soma apenas as do mês corrente.
CA-R32: dado 7 compras concluídas, quando abro o início, então vejo 5, da mais recente para a
mais antiga.
CA-R33: dado nenhuma compra concluída, quando abro o início, então vejo o texto de estado vazio
e o botão "Criar primeira lista".
CA-R34: dado uma compra concluída, quando abro seu detalhe, então não há campo editável e vejo
valor final, orçamento e itens com quantidade, preço e parcial.
CA-R35: dado o app no Chrome Android, quando escolho "Adicionar à tela inicial", então o ícone
aparece e abre em modo standalone.
CA-R36: dado o app já carregado uma vez, quando desligo a rede e reabro, então o app shell
carrega sem erro.
CA-R37: dado o app aberto sem rede, quando navego entre início, listas, detalhe e modo compra,
então nenhuma tela exibe erro de conexão.
CA-R38: dado o campo de preço, quando digito "1.999,99", então o valor gravado é 199999; com
"-5", então é rejeitado.
CA-R39: dado o campo de quantidade, quando digito "0,750", então o valor gravado é 750; com
"0", então é rejeitado.
CA-R40: dado lista concluída, quando tento adicionar item, então a ação é bloqueada com aviso e
nada muda no banco.
CA-R41: dado já existir "Compras do mês", quando crio outra com o mesmo nome, então as duas
convivem sem erro.
CA-R42: dado orçamento "0", quando salvo a lista, então vejo erro de orçamento inválido.
CA-R43: dado o app com 2 listas, quando exporto o backup, então um arquivo JSON é baixado com
as listas, itens e produtos.
CA-R44: dado um arquivo de backup válido, quando importo, então as listas entram com novos
identificadores e as existentes permanecem intactas.

## Dados e persistência

IndexedDB via Dexie, banco `listo` v1.

**`listas`**
`id` (uuid) · `nome` (texto 1–60) · `data` (ISO date) · `tipo` (`mensal|semanal|esporadica`) ·
`orcamento_centavos` (int > 0) · `mercado` (texto, opcional) ·
`forma_pagamento` (`dinheiro|pix|credito|debito|vale`) ·
`status` (`planejamento|comprando|concluida`) · `valor_final_centavos` (int, nulo até concluir) ·
`data_conclusao` (ISO date, nula até concluir) · `criado_em` · `atualizado_em`
Índices: `data`, `status`, `data_conclusao`

**`itens`**
`id` (uuid) · `lista_id` · `produto_id` (opcional) · `nome` (texto 1–80) ·
`quantidade_milesimos` (int > 0) · `preco_unitario_centavos` (int ≥ 0) ·
`adquirido` (bool) · `ordem` (int) · `criado_em` · `atualizado_em`
Índices: `lista_id`, `[lista_id+ordem]`

**`produtos`**
`id` (uuid) · `nome` (texto) · `nome_normalizado` (único) · `preco_padrao_centavos` (int) ·
`ultimo_preco_centavos` (int) · `criado_em` · `atualizado_em`
Índice único: `nome_normalizado`

**Calculado, nunca gravado no MVP:** parcial do item, total estimado, saldo, total no carrinho.
`valor_final_centavos` é a única soma congelada (ao concluir).

## Telas e navegação

- `/` **Início** — total do mês, últimas 5 compras, botão "Nova lista". Estados: vazio,
  carregado.
- `/listas` **Listas** — cards por data decrescente, agrupados por status.
- `/listas/nova` **Nova lista** — formulário do R4.
- `/listas/:id` **Detalhe** — cabeçalho (total estimado, orçamento, saldo), itens, campo de
  adição. Em `concluida`, vira somente leitura (R34).
- `/listas/:id/compra` **Modo Compra** — cabeçalho duplo, itens com checkbox, botão "+".
- `/listas/:id/finalizar` **Finalizar** — resumo e confirmação.

## Fora de escopo desta versão

Conta, login, senha, recuperação de senha, onboarding, nuvem/sync, gráficos, comparação entre
períodos, orçamento mensal global, busca e filtro de listas, histórico de preço médio,
compartilhamento, código de barras, comparação entre mercados, e-commerce, sugestão por
histórico. Tudo isso está em `ROADMAP.md` (V1/V2/V3).

## Riscos

1. **Dado local morre com o navegador.** Limpar dados do site apaga tudo. Mitigação no MVP:
   R43/R44 (exportar/importar) e aviso na tela de ajustes. Resolve de vez na V1 com nuvem.
2. **iOS Safari e PWA offline.** Service worker e IndexedDB no iOS têm histórico de
   comportamento irregular. Mitigação: testar em iPhone real antes de declarar M-08 pronto.
3. **Quantidade fracionada.** 0,750 kg × R$ 39,90 é o caso que erra arredondamento. Mitigação:
   R15 com `round_half_up` único e teste dedicado.
4. **Migração de esquema na V1.** Dexie versionado desde o MVP (R1) para que a chegada de conta
   e sync não exija recriar o banco.
5. **Escopo do modo compra crescer.** É a tela mais gostosa de melhorar. Mitigação: qualquer
   ideia nova vai para `ROADMAP.md`, não para esta spec.