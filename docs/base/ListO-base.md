# **Visão geral – Listo**

Nome do app: **Listo**.

---

## **1. Introdução**

### **1.1. Visão Geral do Projeto**

Este documento descreve as especificações funcionais para o "**Listo**". O objetivo principal do projeto é oferecer aos usuários uma ferramenta intuitiva para criar e gerenciar listas de compras, ao mesmo tempo em que fornece uma estimativa de custos e um painel para análise de gastos. A solução visa auxiliar os usuários no planejamento financeiro de suas compras, promovendo maior controle e economia.

### **1.2. Objetivos do Negócio**

- Simplificar o processo de criação de listas de compras.
- Prover uma estimativa de orçamento clara e acessível para as compras planejadas.
- Ajudar o usuário a visualizar e entender seus padrões de gastos com compras de supermercado e afins.
- Oferecer uma plataforma segura e de fácil acesso para o gerenciamento de dados pessoais e de compras.

### **1.3. Escopo do Projeto**

O sistema contemplará as seguintes funcionalidades em sua versão inicial:

- **Módulo de Autenticação e Usuários:**
    - Cadastro de novos usuários.
    - Login seguro (padrão, com código de acesso).
    - Mecanismo de recuperação de senha.
- **Módulo de Listas de Compras:**
    - Criação, edição e exclusão de múltiplas listas.
    - Adição e remoção de produtos nas listas.
- **Módulo de Produtos:**
    - Cadastro de produtos com informações essenciais (nome, marca, preço estimado).
- **Módulo de Análise Financeira:**
    - Cálculo automático do orçamento total da lista.
    - Dashboard visual com resumo dos gastos.

### **1.4. Perfis de Usuário**

- **Usuário Final:** Indivíduo que busca organizar suas compras, controlar seu orçamento e analisar seus gastos de forma prática. Este é o único perfil de usuário para a versão inicial do sistema.

---

## **2. Requisitos Funcionais (Visão de Alto Nível)**

Esta seção descreve as principais funcionalidades do sistema. O detalhamento de cada regra de negócio, critério de aceite e fluxo de tela será realizado em uma fase posterior.

### **2.1. Módulo de Autenticação e Usuários**

|ID|Funcionalidade|Descrição Breve|
|---|---|---|
|**RF-000**|**Tela de Boas-Vindas e Onboarding**|Ao abrir o aplicativo pela primeira vez, o usuário visualiza uma sequência de telas (carrossel) de boas-vindas que apresentam os principais benefícios do 'Plano de Compra'. A última tela oferece as opções para **"Cadastrar"** ou **"Fazer Login"**.|
|**RF-001**|**Cadastro de Usuário**|Permite que um novo usuário crie uma conta no sistema fornecendo informações básicas.|
|**RF-002**|**Login de Usuário**|Permite que um usuário registrado acesse o sistema utilizando seu e-mail e senha.|
|**RF-003**|**Login com Código de Acesso**|Como alternativa ao login padrão, o sistema pode enviar um código de uso único para o e-mail do usuário para autenticação.|
|**RF-004**|**Esqueci Minha Senha**|Permite que o usuário inicie um fluxo de redefinição de senha através do seu e-mail cadastrado.|

---

### **2.2. Módulo Principal da Aplicação**

|ID|Funcionalidade|Descrição Breve|
|---|---|---|
|RF-005|**Criação da Lista de Compras**|O usuário pode criar novas listas, nomeá-las (ex: "Compras do Mês", "Churrasco Fim de Semana") e gerenciá-las.|
|RF-006|**Cadastro de Produtos**|O usuário pode cadastrar produtos no sistema. Um produto cadastrado pode ser reutilizado em diferentes listas. O cadastro deve incluir no mínimo **nome** e **preço médio/estimado**.|
|RF-007|**Adicionar Produto à Lista**|Dentro de uma lista, o usuário pode buscar por produtos já cadastrados ou adicionar novos produtos diretamente. Ao adicionar, deve informar a quantidade.|
|RF-008|**Cálculo do Orçamento**|O sistema deve calcular e exibir automaticamente o valor total da lista, multiplicando a quantidade de cada item pelo seu preço cadastrado.|
|RF-009|**Dashboard de Gastos**|Apresenta um painel visual com informações consolidadas sobre os gastos do usuário, como o total gasto no mês ou o valor das últimas listas finalizadas.|

---

## **3. Requisitos Não Funcionais (Iniciais)**

- **Usabilidade:** A interface deve ser limpa, intuitiva e responsiva, adaptando-se a diferentes tamanhos de tela (desktops e dispositivos móveis).
- **Desempenho:** As operações críticas, como login e carregamento de listas, devem ter um tempo de resposta rápido (inferior a 3 segundos).
- **Segurança:** As senhas dos usuários devem ser armazenadas de forma criptografada. A comunicação entre o cliente e o servidor deve utilizar o protocolo HTTPS.
- **Disponibilidade:** O sistema deve ter uma alta taxa de disponibilidade, com manutenções programadas comunicadas previamente aos usuários.

---

## **4. Fora do Escopo (Para a Versão 1.0)**

As seguintes funcionalidades não serão incluídas na versão inicial do projeto para manter o foco e garantir a qualidade da entrega principal:

- Compartilhamento de listas com outros usuários.
- Criação de compras em familia, em que qualquer pessoa da familia pode ver e gerenciar as compras.
- Módulo de rede social, que as pessoas possam divulgar preços e situações nos supermercados, no estilo _**Waze.**_
- Comparação de preços entre diferentes supermercados.
- Integração com e-commerces.
- Leitura de código de barras para adicionar produtos.
- Sugestão de produtos com base no histórico de compras.

---

# **Documentação Funcional –** Tela de Boas-Vindas e Onboarding

ID da Funcionalidade: RF-000

Nome da Funcionalidade: Tela de Boas-Vindas e Onboarding

Módulo: Autenticação e Usuários

Versão: 1.0

---

## **1. Descrição e Objetivo**

Esta funcionalidade consiste em uma sequência de telas introdutórias (carrossel de onboarding) exibidas quando um usuário abre o aplicativo pela primeira vez. O objetivo é apresentar os principais recursos e a proposta de valor do "Plano de Compra" de forma rápida e visual, educando o usuário sobre como o aplicativo pode ajudá-lo, e guiá-lo para as ações de cadastro ou login.

## **2. Ator(es)**

- **Visitante / Usuário de primeira viagem:** Qualquer pessoa que abre o aplicativo sem uma sessão de usuário ativa.

## **3. Gatilho / Pré-condições**

- O usuário abre o aplicativo.
- O sistema verifica que não há uma sessão de usuário ativa (usuário não está logado).
- O sistema verifica um indicador local (flag) de que o onboarding ainda não foi concluído por aquele dispositivo.

## **4. Pós-condições / Critérios de Aceite**

- **Ao concluir o fluxo:**
    - Ao clicar no botão "Criar Conta", o usuário é redirecionado para a tela de Cadastro (**RF-001**).
    - Ao clicar em "Fazer Login", o usuário é redirecionado para a tela de Login (**RF-002**).
- **Persistência:** Uma vez que o usuário passe pelo onboarding (seja completando o carrossel ou pulando), um indicador local deve ser salvo no dispositivo. Em aberturas futuras do aplicativo (sem estar logado), o usuário deverá ser levado diretamente para a tela final do onboarding (a tela com os botões de ação) ou para a tela de Login.

## **5. Detalhamento dos Componentes e Telas**

O carrossel será composto por 3 telas, com navegação por gesto de arrastar (swipe) ou por botões.

### **Componentes Gerais (presentes em todas as telas)**

- **Indicador de Página:** Um conjunto de 3 pontos na parte inferior da tela, que indica em qual das telas o usuário está (ex: ● ○ ○).
- **Botão "Pular":** Localizado no canto superior direito. Ao ser clicado, leva o usuário diretamente para a Tela 3 (a tela de ação).

### **Tela 1: Organize suas Compras**

- **Imagem/Ilustração:** Uma ilustração amigável de uma pessoa com um carrinho de compras e uma lista de papel, parecendo organizada e feliz.
- **Título (em destaque):** `Bem-vindo ao Plano de Compra!`
- **Texto de Apoio:** `Crie e gerencie suas listas de compras de forma fácil e intuitiva. Nunca mais esqueça um item no supermercado.`
- **Botão de Ação:** `Avançar`

### **Tela 2: Controle seu Orçamento**

- **Imagem/Ilustração:** Uma ilustração mostrando uma calculadora, um cofrinho e moedas ao lado de uma lista de compras.
- **Título (em destaque):** `Saiba quanto vai gastar`
- **Texto de Apoio:** `Cadastre os preços dos produtos e tenha uma estimativa precisa do valor total da sua compra antes da surpresa no caixa.`
- **Botão de Ação:** `Avançar`

### **Tela 3: Pronto para Começar?**

- **Imagem/Ilustração:** Uma ilustração de um gráfico subindo ou um personagem comemorando a economia.
- **Título (em destaque):** `Tudo pronto para economizar?`
- **Texto de Apoio:** `Crie sua conta para salvar suas listas na nuvem, acessar de qualquer lugar e acompanhar seu histórico de gastos.`
- **Botões de Ação Principais:**
    1. **[ Criar Conta ]** - Botão principal, com maior destaque visual (ex: cor de fundo sólida).
    2. **Já tenho uma conta (Fazer Login)** - Botão secundário ou link de texto, com menor destaque.

## **6. Fluxo Principal (Caminho Feliz)**

1. O visitante abre o aplicativo pela primeira vez.
2. A Tela 1 do carrossel de onboarding é exibida.
3. O visitante arrasta a tela para a esquerda (ou clica em "Avançar").
4. A Tela 2 é exibida. O indicador de página muda para (○ ● ○).
5. O visitante arrasta a tela para a esquerda (ou clica em "Avançar").
6. A Tela 3 (tela de ação) é exibida. O indicador de página muda para (○ ○ ●). Não há mais botão "Avançar".
7. O visitante clica no botão **"Criar Conta"**.
8. O sistema navega para a tela de Cadastro de Usuário (**RF-001**).

## **7. Fluxos Alternativos**

- **Fluxo de Login:**
    - O visitante segue os passos 1 a 6 do Fluxo Principal.
    - No passo 7, o visitante clica em **"Já tenho uma conta (Fazer Login)"**.
    - O sistema navega para a tela de Login de Usuário (**RF-002**).
- **Fluxo de "Pular":**
    - O visitante está na Tela 1 ou Tela 2.
    - O visitante clica no botão **"Pular"**.
    - O sistema navega diretamente para a Tela 3 (tela de ação).
- **Fluxo de Retorno ao App (Onboarding já visto):**
    - O visitante já passou pelo onboarding anteriormente.
    - Ao abrir o app (sem estar logado), o sistema verifica o indicador local e ignora as Telas 1 e 2.
    - O sistema exibe diretamente a Tela 3 ou, como alternativa de design, a tela de Login (**RF-002**).

## **8. Requisitos Não Funcionais Associados**

- **Desempenho:** As imagens e ilustrações devem ser otimizadas para carregamento rápido. A transição entre as telas (animação de swipe) deve ser fluida e sem travamentos.
- **Usabilidade:** Os gestos de navegação devem ser responsivos e intuitivos. Os textos e botões devem ter contraste e tamanho adequados para fácil leitura e interação.
- **Compatibilidade:** O layout do onboarding deve se adaptar de forma responsiva a diferentes tamanhos e densidades de tela de dispositivos móveis.

# **Documentação Funcional – Cadastro de Usuário**

ID da Funcionalidade: RF-001

Módulo: Autenticação e Usuários

Versão: 1.0

---

## **1. Descrição e Objetivo**

Esta funcionalidade permite que um novo visitante crie uma conta de usuário na plataforma "Plano de Compra". O objetivo é coletar as informações necessárias para identificar o usuário de forma única, garantir a segurança do seu acesso e personalizar sua experiência futura, incluindo o recebimento de promoções direcionadas.

## **2. Ator(es)**

- **Visitante:** Qualquer pessoa que acesse o sistema sem estar autenticada.

## **3. Pré-condições**

- O visitante deve estar na página de "Cadastro" do sistema.

## **4. Pós-condições (Critérios de Aceite)**

- **Em caso de sucesso:**
    - O sistema valida todos os dados fornecidos.
    - Uma nova conta de usuário é criada e registrada no banco de dados.
    - A senha do usuário é armazenada de forma segura (hash).
    - O usuário é automaticamente autenticado (logado).
    - O usuário é redirecionado para a tela principal do sistema (Dashboard ou tela de Listas).
- **Em caso de falha:**
    - O sistema exibe mensagens de erro claras e específicas junto aos campos que falharam na validação.
    - A conta de usuário não é criada.
    - O usuário permanece na página de cadastro para corrigir as informações.

## **5. Campos do Formulário de Cadastro**

Abaixo estão detalhados todos os campos necessários para o cadastro. Conforme o disclaimer, todos os campos são de preenchimento obrigatório.

|Nome do Campo|Tipo de Campo|Obrigatório?|Regras de Validação / Descrição|
|---|---|---|---|
|**Nome Completo**|Texto|Sim|Deve conter no mínimo duas palavras e apenas letras e espaços.|
|**E-mail**|E-mail|Sim|Deve ser um endereço de e-mail válido (ex: `usuario@dominio.com`). O sistema deve verificar se o e-mail já está em uso.|
|**Senha**|Senha|Sim|O campo exibe os caracteres como asteriscos (`*`). Requisitos mínimos: 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.|
|**Confirmação de Senha**|Senha|Sim|O valor deve ser idêntico ao campo "Senha".|
|**CPF**|Texto (com máscara)|Sim|Deve ser um CPF válido, incluindo a validação dos dígitos verificadores. O formato deve ser `XXX.XXX.XXX-XX`. O sistema deve verificar se o CPF já está em uso.|
|**Número de Celular**|Texto (com máscara)|Sim|Formato com DDD: `(XX) XXXXX-XXXX`.|
|**Endereço Completo**|Texto|Sim|Campo de texto para o usuário inserir seu endereço (Rua, Número, Bairro).|
|**Cidade / Estado**|Lista de Seleção|Sim|Duas listas de seleção: a primeira para o Estado (UF) e a segunda, carregada dinamicamente, para a Cidade correspondente.|
|**Aceite dos Termos**|Checkbox|Sim|O usuário deve marcar esta caixa para prosseguir. O texto deve conter um link para os "Termos de Uso e Política de Privacidade".|

## **6. Fluxo Principal (Caminho Feliz)**

1. O visitante acessa a página de "Cadastro".
2. O visitante preenche todos os campos do formulário com informações válidas.
3. O visitante lê os Termos de Uso e marca a caixa de seleção "Li e aceito os Termos de Uso...".
4. O visitante clica no botão "Criar Minha Conta".
5. O sistema realiza a validação de todos os campos.
6. O sistema verifica se o e-mail e o CPF informados já não existem na base de dados.
7. O sistema cria o registro do novo usuário, armazenando a senha de forma criptografada.
8. O sistema realiza o login automático do novo usuário.
9. O sistema redireciona o usuário para a página principal da aplicação.

## **7. Fluxos de Exceção e Erros**

|Cenário de Erro|Comportamento do Sistema|
|---|---|
|Usuário clica em "Criar Minha Conta" com campos obrigatórios em branco.|Exibe uma mensagem de erro abaixo de cada campo obrigatório não preenchido: "Este campo é obrigatório."|
|E-mail em formato inválido.|Exibe a mensagem: "Por favor, insira um e-mail válido."|
|E-mail já cadastrado.|Exibe a mensagem: "Este e-mail já está em uso. Tente fazer [login](https://www.google.com/search?q=/login) ou use um e-mail diferente."|
|Senhas não conferem.|Exibe a mensagem abaixo do campo "Confirmação de Senha": "As senhas não conferem."|
|Senha não atinge os requisitos mínimos de segurança.|Exibe a mensagem: "A senha deve conter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número."|
|CPF em formato inválido ou com dígitos verificadores incorretos.|Exibe a mensagem: "Por favor, insira um CPF válido."|
|CPF já cadastrado.|Exibe a mensagem: "Este CPF já está cadastrado em nossa base."|
|Checkbox de Termos não foi marcado.|Exibe a mensagem: "Você precisa aceitar os Termos de Uso para criar sua conta."|

## **8. Textos, Mensagens e Disclaimers**

- **Texto para o Checkbox de Termos (Disclaimer):**
    
    > [] Li e aceito os Termos de Uso e a Política de Privacidade do Plano de Compra. Entendo que minhas informações são necessárias para o funcionamento da plataforma e poderão ser utilizadas para personalizar minha experiência e para o envio de comunicações e promoções, conforme descrito na Política de Privacidade.
    
- **Título da Página:** `Crie sua conta no Plano de Compra`
    
- **Texto do Botão de Ação:** `Criar Minha Conta` ou `Cadastrar`
    

---

## **Documentação Funcional –** Login de Usuário

ID da Funcionalidade: RF-002

Nome da Funcionalidade: Login de Usuário

Módulo: Autenticação e Usuários

Versão: 1.0

---

### **1. Descrição e Objetivo**

Esta funcionalidade descreve o processo pelo qual um usuário já registrado no sistema "Plano de Compra" pode se autenticar para acessar sua área pessoal, incluindo suas listas de compras, histórico e dashboard de gastos. O objetivo é garantir o acesso seguro à plataforma, protegendo os dados do usuário e fornecendo uma experiência personalizada.

### **2. Ator(es)**

- **Usuário Registrado:** Um indivíduo que já possui uma conta criada no sistema.

### **3. Gatilho / Pré-condições**

- O usuário acessa a tela de Login. Isso pode ocorrer por diferentes caminhos:
    - Ao selecionar a opção "Fazer Login" na tela de Boas-Vindas (RF-000).
    - Ao tentar acessar uma área restrita do aplicativo sem ter uma sessão ativa.
    - Ao clicar em um link de "Login" disponível em alguma parte do sistema (ex: após fazer logout).

### **4. Pós-condições / Critérios de Aceite**

- **Em caso de sucesso:**
    - As credenciais (e-mail e senha) são validadas com sucesso.
    - Uma sessão de usuário segura é criada e armazenada.
    - O usuário é redirecionado para a tela principal do sistema (Dashboard).
- **Em caso de falha:**
    - A sessão de usuário não é criada.
    - O usuário permanece na tela de Login.
    - Uma mensagem de erro clara é exibida ao usuário, sem especificar qual credencial está incorreta para fins de segurança.

### **5. Detalhamento dos Componentes da Tela de Login**

- **Título:** Texto em destaque, como "Acesse sua conta".
- **Campo "E-mail":** Campo de texto para inserção do e-mail de cadastro. Deve possuir validação de formato de e-mail.
- **Campo "Senha":** Campo de texto do tipo "password", que mascara os caracteres digitados.
    - **Ícone "Mostrar/Ocultar Senha":** Um ícone (geralmente um olho) dentro do campo que, ao ser tocado, alterna a visibilidade da senha.
- **Link "Esqueci minha senha":** Um link de texto que redireciona o usuário para o fluxo de recuperação de senha (**RF-004**).
- **Link "Login com Código de Acesso":** Um link de texto que redireciona o usuário para o fluxo de login via código de acesso (**RF-003**).
- **Botão de Ação "Entrar":** Botão principal que inicia a tentativa de autenticação.
- **Link de Cadastro:** Um texto na parte inferior da tela, como "Ainda não tem uma conta? **Cadastre-se**", que redireciona para a tela de Cadastro (**RF-001**).

### **6. Fluxo Principal (Caminho Feliz)**

1. O usuário acessa a tela de Login.
2. O usuário insere seu e-mail cadastrado no campo "E-mail".
3. O usuário insere sua senha correta no campo "Senha".
4. O usuário clica no botão "Entrar".
5. O sistema envia as credenciais de forma segura para o servidor.
6. O servidor valida se o e-mail existe e se a senha corresponde (comparando o hash da senha).
7. A validação é bem-sucedida. O sistema gera um token de sessão para o usuário.
8. O usuário é redirecionado para a tela do Dashboard, agora autenticado.

### **7. Fluxos de Exceção e Alternativos**

|Cenário|Comportamento do Sistema|
|---|---|
|**Credenciais Inválidas**|O usuário insere um e-mail ou senha incorretos. O sistema exibe uma única mensagem de erro genérica, como: "E-mail ou senha inválidos. Por favor, tente novamente."|
|**Campos Vazios**|O usuário clica em "Entrar" sem preencher um ou ambos os campos. O sistema exibe uma mensagem de validação abaixo de cada campo vazio: "Campo obrigatório."|
|**Tentativas Múltiplas Falhas**|(Requisito de Segurança) Após 5 tentativas de login sem sucesso para a mesma conta, o sistema pode bloquear a conta por um período (ex: 15 minutos) e exibir a mensagem: "Sua conta foi temporariamente bloqueada por segurança. Tente novamente mais tarde ou use a opção 'Esqueci minha senha'."|
|**Usuário clica em "Esqueci minha senha"**|O sistema redireciona o usuário para a tela inicial do fluxo de recuperação de senha (**RF-004**).|
|**Usuário clica em "Login com Código de Acesso"**|O sistema redireciona o usuário para a tela inicial do fluxo de login com código (**RF-003**).|
|**Usuário clica em "Cadastre-se"**|O sistema redireciona o usuário para a tela de Cadastro de Usuário (**RF-001**).|

### **8. Requisitos Não Funcionais Associados**

- **Segurança:**
    - A comunicação com o servidor deve ser feita exclusivamente via protocolo HTTPS.
    - A senha nunca deve ser armazenada em texto plano, mas sim como um hash criptográfico forte (ex: Argon2, bcrypt).
    - O sistema deve ter proteção contra ataques de força bruta (ex: rate limiting).
- **Desempenho:** O tempo de resposta para uma tentativa de login (sucesso ou falha) deve ser inferior a 2 segundos em condições normais de rede.
- **Usabilidade:** A mensagem de erro deve ser clara e não deve culpar o usuário. A opção de recuperar a senha deve estar sempre visível e acessível.

---

## **Documentação Funcional –** Login com Código de Acesso

ID da Funcionalidade: RF-003

Nome da Funcionalidade: Login com Código de Acesso

Módulo: Autenticação e Usuários

Versão: 1.0

---

### **1. Descrição e Objetivo**

Esta funcionalidade oferece um método de autenticação alternativo ao login com senha. O usuário informa seu e-mail cadastrado, recebe um código numérico de uso único e curta duração em sua caixa de entrada e utiliza este código para acessar o sistema. O objetivo é fornecer uma maneira rápida e segura de login, especialmente para usuários que esqueceram sua senha ou preferem não utilizá-la.

### **2. Ator(es)**

- **Usuário Registrado:** Um indivíduo que já possui uma conta criada no sistema.

### **3. Gatilho / Pré-condições**

- O usuário está na tela de Login padrão (**RF-002**).
- O usuário clica no link de texto "Login com Código de Acesso".

### **4. Pós-condições / Critérios de Aceite**

- **Em caso de sucesso:**
    - O código informado pelo usuário é validado com sucesso dentro do seu prazo de validade.
    - O código de acesso é invalidado imediatamente para impedir o reuso.
    - Uma sessão de usuário segura é criada.
    - O usuário é redirecionado para a tela principal do sistema (Dashboard).
- **Em caso de falha:**
    - A sessão não é criada.
    - Uma mensagem de erro apropriada é exibida, e o usuário permanece no fluxo de login por código.

### **5. Detalhamento das Telas e Componentes**

Este fluxo é composto por duas telas principais e um e-mail transacional.

### **Tela 1: Solicitação do Código**

- **Título:** `Acessar com código`
- **Texto de Instrução:** "Informe seu e-mail cadastrado. Nós enviaremos um código de uso único para você acessar sua conta."
- **Campo "E-mail":** Campo de texto para inserção do e-mail.
- **Botão de Ação:** `[ Enviar código ]`
- **Link de Retorno:** `Voltar para o login com senha` (redireciona para **RF-002**).

### **Tela 2: Verificação do Código**

- **Título:** `Verifique seu e-mail`
- **Texto de Instrução:** Exibe dinamicamente o e-mail do usuário. "Enviamos um código de 6 dígitos para **[nome.usuario@email.com](mailto:nome.usuario@email.com)**. Insira-o abaixo."
- **Texto de Validade:** "O código expira em 10 minutos."
- **Campos de Código:** Seis campos de entrada para os dígitos do código. O foco deve pular automaticamente para o próximo campo após a inserção de um dígito.
- **Botão de Ação:** `[ Validar e Entrar ]` (fica habilitado apenas quando os 6 dígitos são preenchidos).
- **Link de Reenvio:** "Não recebeu o código? **Reenviar**". Este link deve ficar desabilitado por 60 segundos após o envio, exibindo um contador regressivo (`Reenviar em 59s`).

### **Componente 3: Template do E-mail**

- **Assunto:** `Seu código de acesso para o Plano de Compra`
    
- **Corpo do E-mail:**
    
    > "Olá, [Nome do Usuário],
    > 
    > Use o código abaixo para fazer login na sua conta do Plano de Compra.
    > 
    > **123456**
    > 
    > Este código é válido por 10 minutos. Se você não solicitou este acesso, pode ignorar este e-mail com segurança.
    > 
    > Atenciosamente,
    > 
    > Equipe Plano de Compra"
    

### **6. Fluxo Principal (Caminho Feliz)**

1. Na tela de Login (**RF-002**), o usuário clica em "Login com Código de Acesso".
2. O sistema exibe a **Tela 1 (Solicitação do Código)**.
3. O usuário digita seu e-mail cadastrado e clica em "Enviar código".
4. O sistema verifica se o e-mail existe na base de dados.
5. O sistema gera um código aleatório de 6 dígitos, o associa à conta do usuário e define um tempo de expiração (10 minutos).
6. O sistema dispara o e-mail transacional contendo o código para o endereço do usuário.
7. O sistema exibe a **Tela 2 (Verificação do Código)** ao usuário.
8. O usuário abre seu e-mail, visualiza o código e o insere nos campos da Tela 2.
9. O usuário clica em "Validar e Entrar".
10. O sistema verifica se o código informado corresponde ao código armazenado e se não está expirado.
11. A validação é bem-sucedida. O sistema invalida o código usado, cria a sessão e redireciona o usuário para o Dashboard.

### **7. Fluxos de Exceção e Alternativos**

|Cenário|Comportamento do Sistema|
|---|---|
|**E-mail não cadastrado**|Na Tela 1, o usuário informa um e-mail que não existe no sistema. Uma mensagem de erro é exibida: "Nenhuma conta encontrada com este e-mail."|
|**Código Inválido**|Na Tela 2, o usuário informa um código incorreto. Uma mensagem de erro é exibida: "Código inválido. Tente novamente." O sistema pode limitar o número de tentativas (ex: 3 tentativas) antes de invalidar o código.|
|**Código Expirado**|Na Tela 2, o usuário informa o código correto, mas após o prazo de 10 minutos. Uma mensagem de erro é exibida: "Este código expirou. Por favor, solicite um novo."|
|**Reenvio de Código**|Na Tela 2, o usuário clica em "Reenviar". O sistema gera um **novo** código, invalida o anterior e envia um novo e-mail. O contador de 60 segundos é reiniciado.|
|**Falha no Serviço de E-mail**|Se o sistema não conseguir se comunicar com o serviço de envio de e-mails, uma mensagem genérica é exibida: "Ocorreu um erro ao enviar o código. Tente novamente em alguns instantes."|

### **8. Requisitos Não Funcionais Associados**

- **Segurança:**
    - O código deve ser gerado por um gerador de números pseudoaleatórios seguro (CSPRNG).
    - O código deve ser de uso único e ter um tempo de expiração curto e estritamente aplicado pelo servidor.
    - O sistema deve aplicar _rate limiting_ (limitação de taxa) nas solicitações de envio e de validação de código para prevenir ataques de força bruta e abuso do serviço de e-mail.
- **Integração:** O sistema necessita de integração com um serviço de e-mail transacional confiável (ex: Amazon SES, SendGrid, Mailgun) para garantir a entrega rápida dos códigos.

---

## **Documentação Funcional – Plano de Compra**

ID da Funcionalidade: RF-004

Nome da Funcionalidade: Esqueci Minha Senha (Recuperação de Senha)

Módulo: Autenticação e Usuários

Versão: 1.0

---

### **1. Descrição e Objetivo**

Esta funcionalidade permite que um usuário registrado, que não se lembra de sua senha, inicie um processo seguro e automatizado para redefini-la. O sistema valida a identidade do usuário enviando um link seguro e de uso único para o seu e-mail cadastrado, permitindo que ele estabeleça uma nova senha e recupere o acesso à sua conta.

### **2. Ator(es)**

- **Usuário Registrado:** Um indivíduo que possui uma conta, mas não consegue acessá-la por ter esquecido sua senha.

### **3. Gatilho / Pré-condições**

- O usuário está na tela de Login (**RF-002**).
- O usuário clica no link de texto "Esqueci minha senha".

### **4. Pós-condições / Critérios de Aceite**

- **Em caso de sucesso:**
    - A nova senha do usuário é atualizada no banco de dados de forma segura (hash).
    - O link/token de redefinição de senha é permanentemente invalidado após o uso.
    - O usuário é notificado sobre o sucesso da operação e direcionado para a tela de Login para acessar a conta com a nova senha.
- **Em caso de falha:**
    - A senha do usuário não é alterada.
    - O usuário recebe uma mensagem de erro apropriada (ex: link expirado).

### **5. Detalhamento das Telas e Componentes**

Este fluxo é composto por três telas e um e-mail transacional.

### **Tela 1: Solicitação de Redefinição**

- **Título:** `Recuperar Senha`
- **Texto de Instrução:** "Perdeu sua senha? Sem problemas. Insira seu e-mail cadastrado abaixo e enviaremos um link para você criar uma nova."
- **Campo "E-mail":** Campo de texto para o usuário inserir seu e-mail.
- **Botão de Ação:** `[ Enviar link de recuperação ]`
- **Link de Retorno:** `Lembrou a senha? Voltar para o Login` (redireciona para **RF-002**).

## **E-mail de Redefinição de Senha**

- **Assunto:** `Crie uma nova senha para sua conta Plano de Compra`
    
- **Corpo do E-mail:**
    
    > "Olá, [Nome do Usuário],
    > 
    > Parece que você solicitou uma nova senha. Clique no botão abaixo para escolher uma nova.
    > 
    > **[ Botão: Criar Nova Senha ]**
    > 
    > Este link de redefinição de senha expirará em 60 minutos.
    > 
    > Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha não será alterada.
    > 
    > Atenciosamente,
    > 
    > Equipe Plano de Compra"
    

### **Tela 2: Formulário de Nova Senha**

- (Esta tela é acessada através do link seguro enviado por e-mail)
- **Título:** `Crie sua nova senha`
- **Texto de Instrução:** "Sua nova senha deve ser diferente das senhas usadas anteriormente."
- **Campo "Nova Senha":** Campo de texto do tipo "password" com os mesmos requisitos de segurança do cadastro.
- **Campo "Confirmar Nova Senha":** Campo de texto do tipo "password" para confirmação.
- **Botão de Ação:** `[ Redefinir Senha ]`

### **Tela 3: Confirmação de Sucesso**

- **Ícone:** Um ícone de verificação (✔).
- **Título:** `Senha alterada com sucesso!`
- **Texto de Apoio:** "Agora você já pode acessar sua conta com sua nova senha."
- **Botão de Ação:** `[ Ir para o Login ]` (redireciona para **RF-002**).

### **6. Fluxo Principal (Caminho Feliz)**

1. Na tela de Login, o usuário clica em "Esqueci minha senha".
2. O sistema exibe a **Tela 1 (Solicitação de Redefinição)**.
3. O usuário digita seu e-mail e clica em "Enviar link de recuperação".
4. O sistema exibe uma mensagem genérica de confirmação na tela: "Se este e-mail estiver em nossa base de dados, um link de recuperação será enviado em instantes." (Isto previne a enumeração de usuários).
5. O sistema verifica internamente se o e-mail existe. Se sim, gera um token seguro, de uso único e com validade de 60 minutos, e dispara o **E-mail de Redefinição** para o usuário.
6. O usuário abre seu e-mail e clica no link/botão "Criar Nova Senha".
7. O sistema abre a **Tela 2 (Formulário de Nova Senha)**, validando a integridade e a validade do token na URL.
8. O usuário preenche os campos "Nova Senha" e "Confirmar Nova Senha", atendendo aos critérios de segurança.
9. O usuário clica em "Redefinir Senha".
10. O sistema valida se as senhas coincidem e se os critérios foram atendidos. Em seguida, atualiza a senha do usuário no banco de dados e invalida o token de recuperação.
11. O sistema exibe a **Tela 3 (Confirmação de Sucesso)**.

### **7. Fluxos de Exceção e Alternativos**

|Cenário|Comportamento do Sistema|
|---|---|
|**E-mail não cadastrado**|Na Tela 1, o sistema exibe a mesma mensagem de confirmação genérica para não informar a um potencial atacante se um e-mail é válido ou não. Nenhum e-mail é enviado.|
|**Link inválido ou expirado**|O usuário clica em um link que já foi usado ou cujo prazo de 60 minutos expirou. O sistema exibe uma tela de erro com a mensagem: "Este link de recuperação é inválido ou já expirou. Por favor, solicite um novo."|
|**Senhas não conferem**|Na Tela 2, se os campos de senha não forem idênticos, o sistema exibe uma mensagem de erro abaixo do campo de confirmação: "As senhas não conferem."|
|**Nova senha não atende aos critérios**|Na Tela 2, se a senha for muito fraca, o sistema exibe a mensagem de erro com os requisitos: "A senha deve conter no mínimo 8 caracteres, uma letra maiúscula..."|

### **8. Requisitos Não Funcionais Associados**

- **Segurança (Crítico):**
    - O token de redefinição deve ser criptograficamente seguro, de uso único e com tempo de expiração curto e obrigatório (ex: 10 minutos).
    - O sistema não deve, em hipótese alguma, confirmar a existência de um e-mail na tela de solicitação.
    - Todo o fluxo deve ocorrer sob o protocolo HTTPS.
- **Integração:** Depende do mesmo serviço de e-mail transacional confiável das outras funcionalidades de autenticação.

---

# **Documentação Funcional –** Gestão de Listas de Compras

ID do Módulo: RF-M02

Nome do Módulo: Gestão de Listas de Compras

Versão: 1.0

---

### **Visão Geral do Módulo**

Este módulo engloba todo o ciclo de vida de uma lista de compras. Ele permite que o usuário crie e defina as propriedades de uma lista (como seu orçamento e tipo), adicione e gerencie os produtos dentro dela, e a utilize de forma interativa durante a ida ao supermercado. Os dados gerados aqui são a base para o dashboard de controle financeiro.

---

## **Criação e Gerenciamento da Lista**

ID da Funcionalidade: RF-005

Nome da Funcionalidade: Criação e Gerenciamento de Lista

### **1. Descrição e Objetivo**

Permitir que o usuário crie um "container" para sua compra, definindo metadados essenciais que ajudarão no seu planejamento e organização financeira. O usuário também poderá visualizar, editar e excluir suas listas existentes.

### **2. Ator(es)**

- Usuário Autenticado

### **3. Gatilho / Pré-condições**

- O usuário está na tela principal do aplicativo (Dashboard ou Tela de Listas) e clica na ação "Criar Nova Lista".

### **4. Pós-condições / Critérios de Aceite**

- **Em caso de sucesso:** Uma nova lista, ainda sem produtos, é criada e aparece na tela de listas do usuário. O usuário é redirecionado para a tela de detalhes da lista recém-criada para começar a adicionar produtos.
- **Em caso de edição:** As informações da lista são atualizadas.
- **Em caso de exclusão:** A lista é removida permanentemente do sistema após uma confirmação do usuário.

### **5. Campos do Formulário de Criação/Edição da Lista**

|Nome do Campo|Tipo de Campo|Obrigatório?|Regras de Validação / Descrição|
|---|---|---|---|
|**Nome da Lista**|Texto|Sim|Nome para identificação da lista (ex: "Compras do Mês", "Aniversário do João").|
|**Data da Lista**|Data|Sim|Data em que a compra será/foi realizada. Essencial para o agrupamento mensal de gastos. Padrão: data atual.|
|**Tipo de Compra**|Lista de Seleção|Sim|Opções: `Mensal`, `Semanal`, `Esporádica`. Usado para categorizar e filtrar as compras.|
|**Orçamento (R$)**|Numérico (Moeda)|Sim|O valor máximo que o usuário pretende gastar nesta compra.|
|**Nome do Supermercado**|Texto|Não|Campo opcional para o usuário registrar onde a compra será feita.|
|**Forma de Pagamento**|Lista de Seleção|Sim|Opções: `Dinheiro`, `Pix`, `Cartão de Crédito`, `Cartão de Débito`, `Vale Alimentação`.|

### **6. Fluxo Principal (Criação)**

1. Usuário clica no botão "Criar Nova Lista".
2. O formulário com os campos acima é exibido.
3. Usuário preenche as informações da lista.
4. Usuário clica em "Salvar Lista".
5. O sistema valida os campos obrigatórios.
6. A lista é criada e o usuário é levado à tela de detalhes da lista para adicionar produtos.

---

## **Adicionar e Gerenciar Produtos na Lista**

ID da Funcionalidade: RF-006

Nome da Funcionalidade: Adicionar/Gerenciar Produtos na Lista

### **1. Descrição e Objetivo**

Após a criação da lista, esta funcionalidade permite ao usuário populá-la com os itens que deseja comprar, especificando quantidade e preço, para que o sistema possa calcular o custo total estimado.

### **2. Ator(es)**

- Usuário Autenticado

### **3. Pré-condições**

- O usuário está visualizando os detalhes de uma lista de compras existente.

### **4. Componentes da Tela de Detalhes da Lista**

- **Cabeçalho:** Exibe o `Nome da Lista`, o `Valor Total Estimado` dos itens e o `Orçamento` definido. Uma barra de progresso pode mostrar visualmente o quanto o valor total se aproxima do orçamento.
- **Campo de Adição:** Um campo de texto para "Adicionar produto".
- **Lista de Produtos:** A relação de itens já adicionados, cada um com suas informações.

### **5. Fluxo Principal (Adicionar Produto)**

1. Na tela de detalhes da lista, o usuário foca no campo "Adicionar produto" e começa a digitar o nome do item (ex: "Leite Integral").
2. O sistema pode sugerir produtos já cadastrados anteriormente (autocomplete).
3. Ao confirmar o nome do produto, o sistema solicita:
    - **Quantidade:** (Numérico. Padrão: 1).
    - **Preço Estimado (R$):** (Numérico. Se o produto já foi usado antes, o sistema pode sugerir o último preço pago).
4. Usuário clica em "Adicionar".
5. O item é adicionado à lista de produtos. O `Valor Total Estimado` da lista é recalculado e atualizado na tela em tempo real.

### **6. Gerenciamento dos Itens**

- **Editar:** O usuário pode clicar em um item da lista para editar sua quantidade ou preço estimado.
- **Remover:** Cada item na lista deve ter uma ação clara (um ícone de lixeira ou um gesto de "arrastar para excluir") para ser removido.
- **Marcar como Adquirido:** (Ver próxima seção).

---

## **Documentação Funcional –** Uso da Lista em Modo de Compra

ID da Funcionalidade: RF-007

Nome da Funcionalidade: Uso da Lista em Modo de Compra

Versão: 1.1 (Atualizada)

Data: 05 de agosto de 2025

---

### **1. Descrição e Objetivo**

Transformar a lista de produtos em uma ferramenta interativa para ser usada durante a compra no supermercado. O objetivo é facilitar a marcação de itens já colocados no carrinho, acompanhar o custo real da compra e permitir a adição de itens não planejados de forma ágil.

### **2. Ator(es)**

- Usuário Autenticado

### **3. Gatilho / Pré-condições**

- O usuário está na tela de detalhes da lista e clica em um botão como **"Iniciar Compra"**.

### **4. Funcionalidades do "Modo Compra"**

- **Interface Simplificada:** A interface deve ser limpa, com fontes grandes e botões fáceis de tocar.
- **Checkbox por Item:** Cada produto na lista é precedido por uma caixa de marcação (checkbox).
- **Marcar Item:** Ao tocar no checkbox, o item é marcado como "no carrinho". Visualmente, ele deve mudar de estado (ex: ficar cinza, ser riscado e/ou movido para o final da lista).
- **Total do Carrinho:** O sistema deve exibir dois valores de forma proeminente:
    - **Total Estimado:** O valor total da lista original.
    - **Total no Carrinho:** O valor total **apenas** dos itens marcados com o checkbox. Este valor é atualizado em tempo real.
- **Ajuste Rápido:** O usuário deve poder editar facilmente o preço ou a quantidade de um item antes de marcá-lo, caso o valor no supermercado seja diferente do estimado.
- **Adição Rápida de Item (Novo):**
    - **Gatilho:** O usuário pode adicionar um item não previsto na lista através de um botão de acesso rápido (ex: um botão flutuante com o ícone '+').
    - **Formulário Simplificado:** Ao clicar, um formulário rápido (modal ou bottom sheet) é exibido, solicitando:
        1. `Nome do Produto` (Texto)
        2. `Preço` (Numérico)
        3. `Quantidade` (Numérico)
    - **Opção de Salvar Produto:** No mesmo formulário, haverá um checkbox com o texto: **`Salvar este produto no meu catálogo para futuras compras`**.
    - **Comportamento:**
        - Se o checkbox for **marcado**, o produto (nome e preço) é salvo na base de dados geral de produtos do usuário para ser sugerido em compras futuras.
        - Se o checkbox **não for marcado**, o produto é adicionado apenas a esta lista de compra atual, sem sujar o catálogo principal do usuário.
    - **Resultado:** Após a confirmação, o item é adicionado à lista e **automaticamente marcado como 'no carrinho'**, e seu valor é somado imediatamente ao `Total no Carrinho`.
- **Finalizar Compra:** Um botão "Finalizar Compra" deve estar presente. Ao ser clicado:
    1. O sistema exibe um resumo: valor final, quanto ficou abaixo/acima do orçamento.
    2. O usuário confirma a finalização.
    3. A lista é marcada com o status "Concluída".
    4. O valor final é gravado e passa a contar no **orçamento total mensal** exibido no Dashboard.

---

## **Documentação Funcional –** Cálculo Automático do Orçamento da Lista

ID da Funcionalidade: RF-008

Nome da Funcionalidade: Cálculo Automático do Orçamento da Lista

Módulo: Gestão de Listas de Compras (RF-M02)

Versão: 1.0

---

### **1. Descrição e Objetivo**

Esta funcionalidade é o motor de cálculo do sistema. Ela é responsável por processar dinamicamente os valores dos itens dentro de uma lista de compras para fornecer ao usuário um feedback financeiro em tempo real. O objetivo é dar ao usuário visibilidade imediata sobre o custo estimado de sua lista, permitindo a comparação com o orçamento planejado e o acompanhamento dos gastos durante a compra.

### **2. Ator(es)**

- **Sistema** (Ator Principal): Realiza os cálculos automaticamente.
- **Usuário Autenticado:** Desencadeia os cálculos através de suas ações na interface.

### **3. Regras de Cálculo**

O sistema deve seguir as seguintes fórmulas para apresentar os valores:

- **A. Valor Parcial por Item:**
    - `Valor Parcial = Quantidade do Item × Preço Unitário Estimado do Item`
- **B. Valor Total Estimado da Lista:**
    - `Valor Total Estimado = Σ (Soma de todos os "Valores Parciais" dos itens presentes na lista)`
- **C. Saldo do Orçamento:**
    - `Saldo = Orçamento Definido na Lista - Valor Total Estimado`
    - Este valor pode ser positivo (abaixo do orçamento) ou negativo (acima do orçamento).
- **D. Total no Carrinho (Exclusivo do "Modo Compra" - RF-007):**
    - `Total no Carrinho = Σ (Soma dos "Valores Parciais" apenas dos itens marcados como 'adquiridos')`

### **4. Gatilhos de Recálculo**

O `Valor Total Estimado` da lista e o `Saldo do Orçamento` devem ser recalculados instantaneamente sempre que ocorrer uma das seguintes ações:

- Um novo item é **adicionado** à lista.
- Um item existente é **removido** da lista.
- A **quantidade** de um item na lista é alterada.
- O **preço unitário estimado** de um item na lista é alterado.

O `Total no Carrinho` (em "Modo Compra") deve ser recalculado sempre que:

- Um item é **marcado** como adquirido (checkbox).
- Um item é **desmarcado**.
- A quantidade ou o preço de um item marcado é ajustado.

### **5. Pontos de Exibição**

O resultado dos cálculos deve ser exibido de forma clara e proeminente nos seguintes locais:

1. **Tela de Detalhes da Lista (Planejamento):**
    - Um cabeçalho fixo deve exibir o `Valor Total Estimado` e o `Orçamento` lado a lado, para fácil comparação.
    - **Recomendação de UX:** Exibir o `Saldo do Orçamento` (ex: "R$ 25,50 abaixo do orçamento"). A cor do `Valor Total Estimado` pode mudar para vermelho ou laranja se ultrapassar o orçamento definido.
2. **Tela "Modo Compra" (Execução):**
    - Conforme definido em **RF-007**, o cabeçalho deve exibir tanto o `Valor Total Estimado` da lista completa quanto o `Total no Carrinho` em tempo real.
3. **Tela de Listagem Geral:**
    - Cada lista (apresentada como um card, por exemplo) deve exibir seu `Valor Total Estimado` (ou o valor final, se a compra já foi concluída).
4. **Dashboard de Gastos:**
    - O valor final da compra (após "Finalizar Compra" no Modo Compra) é o dado que será consumido pelo dashboard para compor os gastos totais do mês.

### **6. Exemplo Prático de Fluxo**

1. **Criação:** Usuário cria a lista "Churrasco" com `Orçamento: R$ 200,00`. Na tela, o `Valor Total Estimado` é exibido como `R$ 0,00`.
2. **Adição 1:** Usuário adiciona `Picanha`, Qtd: `2 kg`, Preço: `R$ 70,00/kg`.
    - `Valor Parcial` = 2 × 70 = R$ 140,00.
    - Sistema atualiza o `Valor Total Estimado` para `R$ 140,00`.
3. **Adição 2:** Usuário adiciona `Carvão`, Qtd: `1 saco`, Preço: `R$ 25,00/saco`.
    - `Valor Parcial` = 1 × 25 = R$ 25,00.
    - Sistema atualiza o `Valor Total Estimado` para `R$ 165,00` (140,00 + 25,00).
4. **Edição:** Usuário percebe que precisa de mais carvão e altera a quantidade para `2`.
    - Novo `Valor Parcial` do Carvão = 2 × 25 = R$ 50,00.
    - Sistema recalcula e atualiza o `Valor Total Estimado` para `R$ 190,00` (140,00 + 50,00).

### **7. Requisitos Não Funcionais Associados**

- **Desempenho:** Os cálculos devem ser realizados no lado do cliente (client-side) para garantir feedback instantâneo na interface, sem a necessidade de uma requisição ao servidor para cada alteração.
- **Precisão:** Para evitar erros de arredondamento com moeda, os cálculos não devem utilizar tipos de dados de ponto flutuante padrão (`float`). Deve-se usar tipos `Decimal` ou trabalhar com valores inteiros em centavos.
- **Usabilidade:** A atualização dos valores na tela deve ser imediata e perceptível, confirmando ao usuário que sua ação teve o efeito esperado.

---

## **Documentação Funcional –** Dashboard de Gastos

ID da Funcionalidade: RF-009

Nome da Funcionalidade: Dashboard de Gastos

Módulo: Análise e Relatórios

Versão: 1.0

---

### **1. Descrição e Objetivo**

O Dashboard de Gastos é o painel de controle financeiro do usuário. Ele apresenta, de forma visual e consolidada, informações sobre os gastos realizados através do aplicativo. O objetivo é fornecer ao usuário insights claros sobre seus hábitos de consumo, permitindo que ele visualize tendências, compare despesas ao longo do tempo e tome decisões mais informadas sobre seu orçamento.

### **2. Ator(es)**

- **Usuário Autenticado**

### **3. Fonte de Dados e Regras de Negócio**

- **Fonte de Dados:** O dashboard utilizará exclusivamente os dados de listas de compras que foram marcadas com o status **"Concluída"** (conforme o fluxo de "Finalizar Compra" da funcionalidade **RF-007**). Listas em rascunho ou planejamento não são consideradas.
- **Dados Relevantes por Lista:** Para cada lista concluída, o sistema utilizará o `Valor Final` e a `Data da Compra`.
- **Período Padrão:** Ao carregar, o dashboard sempre exibirá os dados consolidados do **"Mês Atual"**.

### **4. Detalhamento dos Componentes do Dashboard**

O dashboard será composto por um conjunto de "widgets" ou componentes visuais interativos.

### **Componente 1: Filtro de Período**

- **Descrição:** Uma lista de seleção (dropdown) no topo da tela que permite ao usuário filtrar os dados de todos os outros componentes do dashboard.
- **Opções:** `Este Mês` (padrão), `Mês Passado`, `Este Ano`.

### **Componente 2: Card de Gasto Total**

- **Descrição:** Um card de destaque que exibe a informação mais importante.
- **Conteúdo:** Apresenta o valor total gasto no período selecionado no filtro.
    - **Título:** "Total Gasto (Este Mês)"
    - **Valor:** `R$ XXXX,XX` (em fonte grande e negrito).
- **Lógica:** Soma do `Valor Final` de todas as listas concluídas cuja `Data da Compra` pertence ao período do filtro.

### **Componente 3: Card de Comparação**

- **Descrição:** Um card secundário que oferece um insight comparativo.
- **Conteúdo:** Compara o gasto do período atual com o período anterior.
    - **Texto:** Exibe uma porcentagem, como: `↑ 15% a mais que no mês passado` ou `↓ 10% a menos que no mês passado`.
    - **Lógica:** `((Total Período Atual / Total Período Anterior) - 1) * 100`. A cor do texto ou do ícone (seta) pode ser verde para economia e vermelha para aumento de gastos.

### **Componente 4: Gráfico de Barras - Evolução Mensal**

- **Descrição:** Um gráfico de barras que ilustra os gastos ao longo do tempo.
- **Título:** `Gastos nos Últimos 6 Meses`
- **Eixo X (Horizontal):** Rótulos dos meses (ex: "Mar", "Abr", "Mai", "Jun", "Jul", "Ago").
- **Eixo Y (Vertical):** Escala de valores em Reais (R$).
- **Lógica:** Cada barra representa o total de gastos de um mês específico.

### **Componente 5: Gráfico de Pizza - Gastos por Tipo de Compra**

- **Descrição:** Um gráfico de pizza (ou rosca/donut) que categoriza as despesas.
- **Título:** `Gastos por Tipo (no período)`
- **Lógica:** As fatias do gráfico representam o percentual do gasto total do período selecionado, dividido pelas categorias definidas na criação da lista (`Mensal`, `Semanal`, `Esporádica`) em **RF-005**.
- **Legenda:** Uma legenda clara deve acompanhar o gráfico.

### **Componente 6: Lista de Compras Recentes**

- **Descrição:** Uma lista rolável com as últimas compras finalizadas.
- **Título:** `Últimas Compras Finalizadas`
- **Conteúdo por Item da Lista:** `Nome da Lista`, `Data da Compra` e `Valor Final`.
- **Lógica:** Exibe as 5 a 10 últimas listas com status "Concluída", ordenadas da mais recente para a mais antiga.

### **5. Interatividade do Usuário**

- **Filtragem:** Ao selecionar uma nova opção no **Filtro de Período**, todos os componentes do dashboard (Cards, Gráficos e a Lista) devem ser atualizados para refletir os dados do novo período.
- **Navegação:** Ao clicar em um item da **Lista de Compras Recentes**, o usuário deve ser levado para uma tela de detalhes (somente leitura) daquela compra específica.
- **Detalhes do Gráfico:** Tocar em uma barra ou fatia de um gráfico pode exibir um "tooltip" com o valor exato daquele item.

### **6. Cenários Especiais**

- **Estado Vazio (Primeiro Uso):** Se o usuário ainda não finalizou nenhuma compra, o dashboard não deve exibir componentes vazios ou com erros. Em vez disso, deve ser exibida uma mensagem amigável:
    
    > "Suas análises de gastos aparecerão aqui!
    > 
    > Para começar, crie e finalize sua primeira lista de compras."
    
    - Um botão de atalho **"[ Criar Primeira Lista ]"** pode ser incluído.
- **Carregamento:** Ao abrir o dashboard, um indicador de carregamento (spinner) deve ser exibido enquanto os dados são buscados e processados.
    

### **7. Requisitos Não Funcionais Associados**

- **Desempenho:** As consultas para agregar os dados do dashboard devem ser otimizadas para carregar rapidamente (idealmente em menos de 3 segundos), mesmo que o usuário tenha um grande histórico de compras.
- **Usabilidade:** As informações devem ser apresentadas de forma limpa e de fácil compreensão. Os gráficos devem ser legíveis e responsivos a diferentes tamanhos de tela.
- **Disponibilidade:** Os dados devem estar sempre atualizados, refletindo imediatamente a finalização de uma nova lista de compras.