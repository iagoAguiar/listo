# Design system — ListO (mobile-first)

**Status:** aplicado no MVP em 2026-11-22 (pedido direto: "quero que ele seja mobile first").
**Direção:** "recibo de mercado, não planilha" — o número grande é a informação, tudo o resto
recua. Uso com uma mão, no corredor, com luz ruim e dedão.

## Fontes consultadas (e o que foi descartado)

- `ui-ux-pro-max --design-system` ("shopping list budget grocery mobile app", density 6, motion 3):
  estilo Flat, paleta verde-comida + âmbar, tipografia de e-commerce. **Descartado:** o padrão
  "Product Demo + Features" (é landing page, não app de uso diário) e a recomendação de Google
  Fonts (o app é offline-first — fonte do sistema é requisito, não preguiça).
- `frontend-design`: aterrar no assunto real, gastar a ousadia em um lugar só. Aqui o lugar é o
  número de dinheiro.
- `ui-ux-pro-max --domain ux`: navegação inferior não pode cobrir conteúdo; teclado correto por
  campo; botão voltar do navegador tem que funcionar (sem `location.replace`).
- Contraste medido em script (WCAG AA 4.5:1): todos os pares abaixo passam. O verde `#059669`
  sugerido pela ferramenta **não** passa com branco (3.77:1) — escurecido para `#047857` (5.48:1).

## Duas direções

1. **Recibo** (adotada): fundo verde-menta bem claro, cartões brancos sem sombra, dinheiro em
   tamanho grande com números tabulares, verde só para "dentro do orçamento" e vermelho só para
   "estourou". Sem gradiente, sem sombra, sem ícone decorativo.
2. **Planilha escura** (descartada): fundo quase preto, números em âmbar, densidade alta. Leria
   melhor à noite no mercado, mas piora a leitura sob luz forte e foge do que o Iago já validou.

## Tokens

| Papel | Token | Valor | Uso |
|---|---|---|---|
| Fundo | `--fundo` | `#ECFDF5` | página inteira |
| Superfície | `--superficie` | `#FFFFFF` | cartão, campo, botão |
| Texto | `--texto` | `#0F172A` | 17.85:1 sobre branco |
| Texto secundário | `--suave` | `#475569` | 7.58:1 sobre branco |
| Linha | `--linha` | `#D1E7E0` | borda de cartão e campo |
| Ação | `--destaque` | `#047857` | botão primário, link, item ativo (branco sobre ele: 5.48:1) |
| Ação forte | `--destaque-forte` | `#065F46` | pressionado |
| Dinheiro ok | `--ok` | `#047857` | saldo positivo |
| Dinheiro estourado | `--perigo` | `#DC2626` | saldo negativo, excluir (branco sobre ele: 4.83:1) |
| Aviso | `--aviso-fundo` / `--aviso-texto` | `#FEF3C7` / `#92400E` | 6.37:1 |
| Sucesso suave | `--ok-fundo` / `--ok-texto` | `#D1FAE5` / `#065F46` | item marcado (6.78:1) |
| Foco | `--anel` | `#047857` | anel de 3px, offset 2px |

- **Tipo:** system-ui (offline). Escala: 13px rótulo, 15px secundário, 16px corpo, 20px título
  de seção, 28px título de tela, 34px dinheiro em destaque. `font-variant-numeric: tabular-nums`
  em todo valor.
- **Espaço:** 4 / 8 / 12 / 16 / 24. Padding de tela 16px. Conteúdo respira 96px embaixo por causa
  da barra inferior e do botão fixo.
- **Raio:** 14px cartão, 12px campo/botão, 999px etiqueta. Sem sombra.
- **Toque:** alvo mínimo 48px, espaçamento entre alvos 8px. Checkbox do modo compra 28px com
  área clicável do item inteiro.
- **Motion:** 160ms ease só em resposta a ação (item marcado, barra de desfazer entrando).
  `prefers-reduced-motion: reduce` zera tudo.
- **Safe area:** `env(safe-area-inset-bottom)` na barra inferior e nos botões fixos.

## Componentes (conjunto mínimo — CREATE, o projeto não tinha biblioteca)

| Componente | Onde | Notas |
|---|---|---|
| Barra inferior | Início, Listas, Ajustes | 3 destinos, ícone + rótulo, item ativo em verde. Some nas telas de tarefa (compra, finalizar, formulário) para não competir com o botão de ação |
| Cartão de lista | Listas | nome, data, status, valor alinhado à direita; o cartão inteiro é o link |
| Cartão de totais | Detalhe, Compra | 3 colunas (estimado / orçamento / saldo) ou 2 (estimado / carrinho) |
| Linha de item | Detalhe, Compra | nome + detalhe à esquerda, parcial à direita; no modo compra ganha checkbox e campos |
| Botão primário | formulários, rodapé | largura total, 52px, verde |
| Botão secundário | rodapé de compra | quadrado 56px, "+" |
| Campo | formulários | rótulo visível acima, nunca só placeholder; `inputmode` numérico em dinheiro e quantidade |
| Etiqueta de status | listas, detalhe | pílula: planejando (cinza), comprando (âmbar), concluída (verde) |
| Aviso / desfazer | detalhe | faixa fixa acima da barra, 8s, com botão |
| Estado vazio | início, listas | frase + ação, nunca só "nenhum" |

## Navegação

- **Barra inferior** (polegar): Início, Listas, Ajustes. O destino "Nova lista" vira botão no topo
  da tela de listas, não um quarto item.
- **Telas de tarefa** (detalhe, compra, finalizar, formulário): sem barra. Voltar é link no topo,
  e o botão de ação fica fixo embaixo, acima da safe area.
- Roteamento continua o do React Router — voltar do navegador funciona porque nada usa `replace`.
- Lista não concluída, aberta em Listas, cai direto no modo compra. Nome, quantidade e preço
  já estão no topo: nenhum toque para revelar o formulário. O "+" só devolve o foco ao nome.
  Depois de adicionar, o foco volta ao nome. Lista concluída continua no detalhe, só leitura.
- Classificação: REUSE do formulário e do rodapé. Sem componente novo.

## O que este sistema não faz

- Dark mode (fica para depois; o uso é no mercado, com luz).
- Tipografia custom (conflita com offline).
- Ícone de marca além do PWA já gerado.
