# Intent — ListO

## O pedido (literal)

> "O nome dele é ListO, vou te passar os detalhes... analise o arquivo em markdown base
> para o Projeto, e separe ele em MVP, V1, V2, etc, e vamos decidir juntos como
> construir ele"

Documento base: `docs/base/ListO-base.md` (923 linhas, copiado do Drive em 2026-11-22,
sha256 `7a86225e…0ff1ae5`). A cópia no repo é a fonte da verdade; o original segue em
`G:/My Drive/.../00_Ideias/ListO.md`.

## O que o produto é

**ListO** é um app de lista de compras com orçamento: o usuário monta a lista de itens
com preço estimado, vê o total antes de sair de casa, usa a lista **no mercado** marcando
o que já foi para o carrinho com o total real em tempo real, e no fim tem o valor da
compra registrado para acompanhar os gastos do mês.

## Problema que resolve

1. Lista de papel não diz quanto vai custar — a surpresa chega no caixa.
2. App de notas não soma, não compara com orçamento, não guarda histórico de gasto.
3. Planilha é atrito: ninguém abre planilha no corredor do mercado.

## Diferencial (o que o documento base acerta e não pode ser cortado)

O **Modo Compra** (RF-007): tela simplificada, checkbox por item, `Total Estimado` ×
`Total no Carrinho` em tempo real, ajuste rápido de preço e adição de item não planejado.
É ali que o app ganha o dia — o resto é CRUD em volta disso.

## Para quem

Uso pessoal do Iago primeiro (compras do mês, churrasco, feira). Segundo passo: qualquer
pessoa que compra com orçamento apertado. **Um perfil de usuário** — o documento base já
exclui compartilhamento e compra em família da versão inicial.

## Plataforma

Web (PWA) mobile-first. O uso principal acontece **no mercado, com uma mão, sinal ruim** —
isso manda no design: offline funciona, alvo de toque grande, teclado numérico, pouca tela.

## Restrições que já conheço

- Dinheiro nunca em `float`: inteiro de centavos (o próprio doc pede isso em RF-008).
- O documento base tem inconsistências de numeração e nome ("Plano de Compra" sobrou de
  uma versão anterior) — ver `_hermes/ROADMAP.md` §"Pendências do documento".
- Predecessor existente: `Desktop/projetos/Lista_de_Compras` (PWA Vite + MD3 + Firestore,
  foco em "quanto posso gastar este mês"). Não é o mesmo produto, mas é o mesmo usuário e
  a mesma stack de referência.