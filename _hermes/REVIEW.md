# Review: MVP do ListO (M-01..M-09) · 6fdb566
REVIEW: passou
Data: 2026-11-22 · Fase: qa

## Evidência

- Suíte: `npx vitest run` → **92 passed (92) em 28,5 s** no SHA `6fdb566`, `git status` limpo.
- Types/build: `npx tsc --noEmit` sem saída (ok) · `npm run build` → `dist` com `index.html`,
  `assets/index-C9jDQGeV.js` (387 kB, 120 kB gzip), `manifest.webmanifest`, `sw.js`, `icons/`.
- Aceite real (não jsdom): `vite preview` em `localhost:4173`, Chrome via CDP.
  - Criar lista `300,00` → detalhe com `TOTAL ESTIMADO R$ 0,00`, `SALDO R$ 300,00` ·
    `R$ 300,00 abaixo do orçamento`.
  - Itens `Arroz 5kg 2 × 24,90` e `Leite 1 × 4,49` → total `R$ 54,29`, saldo `R$ 245,71`
    (2×24,90 = 49,80 conferido em inteiro de centavos).
  - Modo compra: marcar Arroz → item vai para o fim da lista, `TOTAL NO CARRINHO R$ 49,80`,
    `TOTAL ESTIMADO` continua `R$ 54,29` (D-005).
  - Editar preço no modo compra (4,49 → 21,50) → totais recalculados na tela.
  - Finalizar → `VALOR FINAL R$ 21,50`, `1 marcados de 1 itens` → início mostra
    `GASTO NO MÊS R$ 21,50` e a compra nas últimas.
  - Offline: `Network.emulateNetworkConditions offline=true` + reload → app shell abre do
    service worker com dados do IndexedDB; navegação para `/listas` e `/listas/:id` funciona
    sem rede; lista concluída abre somente leitura com `Comprado` e `R$ 21,50` (R36, R37).
- Cobertura dos critérios: **45/45 `CA-R1..CA-R45`** com teste nomeado (`grep` de `CA-R` nos
  arquivos de `tests/aceite/`). Antes desta rodada faltavam CA-R5, CA-R19 e CA-R29.
- Prova de mutação: `valorFinalCentavos` alterado para somar só os marcados
  (`return totalCarrinhoCentavos(itens)`) → **7 testes vermelhos** em 4 arquivos
  (`inclui item não marcado no valor final`, `concluir grava valor final`, `total do mês`,
  `mostra valor final somando todos os itens`, entre outros). Revertido com
  `git checkout -- src/dominio/lista.ts`; suíte de volta a 92/92.
- Bordas exercitadas na suíte: entrada vazia, quantidade até 3 casas (`0,750 kg = 2993`
  centavos), preço 0, tetos de valor (R38/R39), lista concluída read-only (R40),
  import de backup inválido, item duplicado no catálogo por `nome_normalizado`, data de
  conclusão fora do mês corrente.

## Achados

1. [menor, corrigido em `9e6b9d7`] `src/ui/paginas/ModoCompra.tsx` — preço e quantidade eram
   controlados por estado; quando o usuário digitava e saía do campo no mesmo tick, o commit
   do `onBlur` lia estado vazio e não gravava. Reprodução: editar preço e sair imediatamente.
   Agora os campos são não-controlados (máscara escreve no DOM, commit no `blur` lê o valor
   final). Verificado no navegador: 4,49 → 21,50 gravado.
2. [menor, corrigido em `6fdb566`] CA-R5, CA-R19 e CA-R29 estavam implementados mas sem teste
   nomeado. Os três testes foram escritos depois do código — cobertura a posteriori, não
   oráculo antecipado. Registrado aqui por honestidade do processo.
3. [menor, aberto] PWA no iOS Safari não foi testado em aparelho real. Chrome/Chromium
   headless confirma instalação e offline; no iPhone o comportamento de cache do `sw.js`
   pode diferir. Pendência de campo: abrir no iPhone do Iago e desligar a rede. Não bloqueia
   o merge porque o risco está registrado na spec (M-08).
4. [menor, aberto] Ícones são PNG gerados por script (`scripts/gerar-icones.cjs`: cartão teal
   com três linhas). Válidos e instaláveis, mas são provisórios: quando houver logo, trocar
   os dois arquivos e regerar.

## Veredito

Nenhum bloqueante. MVP de M-01 a M-09 entregue com oráculo de aceite congelado, suíte verde no
SHA avaliado e aceite executado em navegador real, inclusive offline. Segue para entrega em
`main` (D-006: repositório de agente único integra em `main`; `develop` entra quando houver
segundo colaborador).