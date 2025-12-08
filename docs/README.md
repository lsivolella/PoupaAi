# Introdução

Informações básicas do projeto.

- **Projeto:** PoupaAí
- **Repositório GitHub:** https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2025-2-ti1-5567100-precos_mercado.git
- **Membros da equipe:**

  - [Bernardo Duarte Medeiros de Paula](https://github.com/bernardodvarte)
  - [Bruna Pedrosa Nunes](https://github.com/brunapedrosabr)
  - [Lucas Gonçalves Sivolella](https://github.com/lsivolella)
  - [Plínio Ângelo Ferreira](https://github.com/afplinio)
  - [Sofia Ferreira Costa](https://github.com/costa-sofia)
  - [Vinicius Ramos Sales](https://github.com/ViniRSales)

A documentação do projeto é estruturada da seguinte forma:

1. Introdução
2. [Contexto](#contexto)
3. [Product Discovery](#product-discovery)
4. [Product Design](#product-design)
5. [Metodologia](#metodologia)
6. [Solução](#solução-implementada)
7. [Referências Bibliográficas](#referências)

✅ [Documentação de Design Thinking (MIRO)](files/Design%20Thinking.pdf)

# Contexto

Detalhes sobre o espaço de problema, os objetivos do projeto, sua justificativa e público-alvo.

## Problema

O cenário atual de compras em supermercados no Brasil apresenta alguns desafios para os consumidores como:

**1. Falta de centralização das Informações**

- Os consumidores precisam consumir múltiplas fontes de informação para comparar preços como sites dos supermercados, aplicativos, folhetos promocionais dos supermercados e/ou anúncios.
- As informações sobre promoções são dispersas e difíceis de encontrar.
- Não é mantido um histórico de compras para o consumidor poder replicar e/ou consultar a fim de otimizar suas compras.

**2. Ineficiência no Planejamento**

- Segundo pesquisa feita pela Neogrid e Opinion Box de 2024, 40% dos brasileiros fazem múltiplicas compras no mês o que pode estar ligado por falta de planejamento ou por preferência do consumidor em dividir por partes.
- As listas de compras são regularmente esquecidas ou incompletas pelos consumidores.
- Não há sugestão ao consumidor baseado em consumo anterior.

**3. Perda de Oportunidade Econômica**

- Segundo pesquisa feita pela Neogrid e Opinion Box de 2024, 85% dos brasileiros compram além do planejado quando encontram produtos com preços mais baixos.
- As promoções são frequentemente descobertas no momento da compra.
- Há carência e falta de alertas personalizados sobre ofertas relevantes para o consumidor específico.

Esse problema se manifesta em um mercado onde 90% dos brasileiros buscam constantemente economia, mas carecem de ferramentas tecnológicas integradas para otimizar suas decisões de compra.

## Objetivos

**Objetivo Geral:** Desenvolver uma aplicação mobile que centralize e otimize a experiência de compras em supermercado, oferecendo comparação de preços, gestão inteligente de listas, alertas personalizados de ofertas e promoções além da visualização no mapa de locais com melhores preços para consumidores brasileiros.

**Objetivos Específicos:**

- Implementar um sistema de comparação de preços
- Criar funcionalidade da gestão inteligente da lista de compras podendo salvar, criar ou editar
- Estabelecer sistema de alertas personalizados para promoções relevantes baseadas nas preferências do usuário

## Justificativa

O desenvolvimento dessa aplicação web se baseia principalmente em três tópicos que são:

**1. Relevância Econômica**

- 47% das despesas familiares brasileiras são com alimentação.
- O setor de supermercados representa 13,6% da receita do comércio nacional.
- 90% dos consumidores buscam constantemente opções mais baratas no quesito supermercado.
- O setor de supermercados é um setor em crescimento com 4% de alta no consumo em 2025.
- A aplicação pode gerar economia significativa para as famílias brasileiros visto que, segundo o Serasa, as compras de supermercado são a principal fonte de endividamente no cartão de crédito dos brasileiros.

**2. Oportunidade Tecnológica**

- 71% dos brasileiros mudaram hábitos de compra no últino ano.
- 30% dos brasileiros pesquisam preços antes de ir ao supermercado.
- 85% dos brasileiros compram além do planejado quando encontram ofertas.
- Há falta de soluções integradas no mercado brasileiro.

**3. Experiência do Consumidor**

- Consumidores buscam praticidade, saúde e escolhas conscientes.

## Público-Alvo

O público alvo do projeto, mesmo que seja uma aplicação que possa servir para toda a sociedade, pode ser definido a partir dos apontamentos descritos abaixo.

- Consumidores em geral que buscam economizar em suas compras, principalmente em produtos de uso cotidiano (alimentos, eletrônicos, medicamentos, etc.).

- Adultos jovens a de meia-idade (18 a 50 anos), que já utilizam aplicativos com frequência para compras online e estão familiarizados com tecnologia.

- Famílias e responsáveis pelas compras domésticas, que procuram os melhores preços para otimizar o orçamento mensal.

- Usuários com renda média que têm mais sensibilidade a variações de preço e, portanto, tendem a buscar alternativas mais baratas.

Em resumo, consumidores preocupados em obter o melhor custo-benefício em suas compras. Como citado anteriormente, embora o sistema possa ser utilizado por qualquer pessoa, ele se destina especialmente a indivíduos entre 18 e 50 anos, familiarizados com tecnologia e que buscam praticidade na comparação de preços. Famílias e responsáveis pelas compras domésticas são também um segmento importante, pois tendem a utilizar a ferramenta para otimizar seus gastos e tempo. Além disso, e também podendo estar atrelado aos outros grupos citados previamente, pessoas com uma renda média ou menor também são essenciais, pois preferencialmente buscarão os produtos com os preços mais em conta.

# Product Discovery

## Etapa de Entendimento

### Matriz CSD

![Matriz CSD](./images/Matriz%20CSD.png)

### Mapa de Stakeholders

![Mapa de Stakeholders](./images/Mapa%20de%20Stakeholders.png)

### Entrevistas Qualitativas

![Entrevistas Qualitativas](./images/Entrevista%20Qualitativa%20Parte%201.png)

![Entrevistas Qualitativas](./images/Entrevista%20Qualitativa%20Parte%202.png)

### Highlights de Pesquisa

![Highlights de Pesquisa](./images/Highlights%20de%20Pesquisa.png)

## Etapa de Definição

### Personas

Persona 1: Osvaldo

![Persona Osvaldo](./images/Persona%20Osvaldo.png)

Persona 2: Pedro

![Persona Pedro](./images/Persona%20Pedro.png)

Persona 3: Carla

![Persona Carla](./images/Persona%20Carla.png)

# Product Design

Nesse momento, vamos transformar os insights e validações obtidos em soluções tangíveis e utilizáveis. Essa fase envolve a definição de uma proposta de valor, detalhando a prioridade de cada ideia e a consequente criação de wireframes, mockups e protótipos de alta fidelidade, que detalham a interface e a experiência do usuário.

## Histórias de Usuários

Com base na análise das personas foram identificadas as seguintes histórias de usuários:

| ID   | EU COMO...`PERSONA`                | QUERO/PRECISO ...`FUNCIONALIDADE`                                           | PARA ...`MOTIVO/VALOR`                                                                   |
| ---- | ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| US01 | Osvaldo                            | Um histórico com os preços dos produtos que costumo consumir                | Evitar lojas que tenham aumentado os preços repentinamente e buscar produtos substitutos |
| US02 | Pedro                              | Encontrar os melhores preços para os produtos                               | Ter mais dinheiro para sair com os amigos                                                |
| US03 | Carla                              | Saber onde posso encontrar os produtos que preciso comprar                  | Ter mais tempo para realizar minhas tarefas e descansar em casa                          |
| US04 | Consumidor geral                   | Um aplicativo que me ajude a descobrir o preço dos produtos de supermercado | Que eu possa comparar preços e assim economizar em minhas compras                        |
| US05 | Dono de restaurante                | Saber o local onde encontro todos produtos que preciso                      | Comprar os ingredientes necessários para cozinhar todos os alimentos do cardápio         |
| US06 | Membro de uma grande família       | Comprar uma grande quantidade de itens no supermercado                      | Atender toda a demanda familiar e manter a qualidade do lar                              |
| US07 | Atleta                             | Encontrar produtos específicos com facilidade                               | Atender minha dieta restrita                                                             |
| US08 | Consumidor com mobilidade reduzida | Consumidor com mobilidade reduzida                                          | Que eu consiga fazer minhas compras sem maiores complicações                             |
| US09 | Empresária                         | Otimizar meu tempo com idas as supermercado                                 | Conciliar meu trabalho com as compras de casa para mim e para minha família              |

## Proposta de Valor

##### Proposta para Persona 1: Osvaldo

![Proposta de Valor Osvaldo](./images/Proposta%20de%20Valor%20Osvaldo.png)

##### Proposta para Persona 2: Pedro

![Proposta de Valor Pedro](./images/Proposta%20de%20Valor%20Pedro.png)

##### Proposta para Persona 3: Carla

![Proposta de Valor Carla](./images/Proposta%20de%20Valor%20Carla.png)

## Projeto de Interface

Artefatos relacionados com a interface e a interacão do usuário na proposta de solução.

### Wireframes

Estes são os protótipos de telas do sistema.

##### Tela de Login

Criamos uma tela de login com possibilidade de se ter uma conta pela própria conta Apple, pelo Gmail ou por um cadastro próprio do site com qualquer tipo de e-mail. Você também pode, caso tenha esquecido a sua senha, clicar no botão "Esqueceu a Senha?", onde será redirecionado para outra tela para resolução do problema.

![Login](images/Login.png)

##### Tela de Cadastro

Nossa tela de cadastros pede informações básicas como o e-mail do usuário, seu nome, telefone e CPF. Além disso, obviamente, também é solicitado a criação de uma senha, além da confirmação da mesma.

![Cadastro](images/Cadastro.png)

##### Esqueceu a Senha (1/3)

Esta é a primeira tela que se apresenta ao clicar que esqueceu sua senha. Neste momento, você deve colocar seu e-mail ou telefone para recuperação.

![Esqueceu Senha 1](images/Esqueceusenha1.png)

##### Esqueceu a Senha (2/3)

Após preencher na tela anterior com e-mail ou telefone, o site te mostrará um campo para preencher com um token que é enviado na opção escolhida anteriormente.

![Esqueceu Senha 2](images/Esqueceusenha2.png)

##### Esqueceu a Senha (3/3)

Por fim, você redefine a sua senha informando-a em ambos os campos, sendo um deles para reconfirmação da mesma.

![Esqueceu Senha 3](images/Esqueceusenha3.png)

##### Tela Inicial

Ao logar e acessar a home, você se deparará com uma tela com uma versão reduzida do mapa de mercados, além de ter a possibilidade de acessar seu histórico de listas ou abrir uma nova. Você também é capaz de fazer uma busca por um item em específico nesta tela.

![Inicial](images/Inicial.png)

##### Lista de Compras

Selecionando seus produtos, o aplicativo te levará para sua lista de compras, onde você poderá adicionar mais produtos, finalizar a lista ou editar os itens já incluídos.

![Lista de Compras](images/listacompras.png)

##### Adicionar Produto

Esta tela serve para adicionar produtos na sua lista de compras. Há filtros de nome, marca e descrição. Também há um campo de quantidade para adicionar mais de um de uma vez caso queira.

![Inicial](images/selecaoprodutos.png)

##### Histórico de Listas

Nesta tela você consegue acessar o histórico de todas as suas listas já feitas, contando com valores totais, quantidade de produtos, além de ser possível detalhar.

![Histórico](images/historicolistas.png)

##### Resumo

Esta é a tela detalhada da sua lista selecionada no histórico. Todos os produtos e seus preços ficam armazenados nela.

![Resumo](images/resumo.png)

##### Mapa de Mercados

Esta é a tela expandida do mapa de mercados mencionado anteriormente. Através dela você consegue visualizar quais supermercados estão mais perto da sua localidade e traçar um caminho até o escolhido.

![Mapa](images/mapa.png)

##### Comparação de Preços

A partir dessa funcionalidade é possível comparar preços de produtos iguais em diferentes supermercados.

![Comparativo](images/Comparativo.png)

##### Filtragem

Na busca por produtos, o site te permite fazer filtros (supermercados, marcas, etc.) para encontrar mais facilmente.

![Filtragem](images/Filtragem.png)

### User Flow

![Fluxo de Telas](images/fluxo.png)

### Protótipo Interativo

Nosso protótipo interativo foi feito através do próprio Figma, basta clicar no link abaixo.

✅ [Protótipo Interativo](https://www.figma.com/proto/LlSi6oktUlezQnomFvF1KN/Pre%C3%A7os-Mercado?node-id=85-132&p=f&t=KJUl4L2lWBopU280-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=85%3A132&show-proto-sidebar=1)

# Metodologia

Detalhes sobre a organização do grupo e o ferramental empregado.

## Ferramentas

Relação de ferramentas empregadas pelo grupo durante o projeto.

| Ambiente                    | Plataforma         | Link de acesso                                                                                               |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Processo de Design Thinking | Miro               | https://miro.com/app/board/uXjVJRfmPqM=/                                                                     |
| Comunicação                 | Google Meet        | https://meet.google.com/                                                                                     |
| Repositório de código       | GitHub             | https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2025-2-ti1-5567100-precos_mercado.git                      |
| Editor de código            | Visual Studio Code | https://code.visualstudio.com/                                                                               |
| Protótipo Interativo        | Figma              | https://www.figma.com/design/LlSi6oktUlezQnomFvF1KN/Pre%C3%A7os-Mercado?node-id=0-1&p=f&t=DBwjVbY4Q0JGavk3-0 |

## Gerenciamento do Projeto

Divisão de papéis no grupo e apresentação da estrutura da ferramenta de controle de tarefas (Kanban).

![Exemplo de Kanban](images/exemplo-kanban.png)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Nesta parte do documento, você deve apresentar o processo de trabalho baseado nas metodologias ágeis, a divisão de papéis e tarefas, as ferramentas empregadas e como foi realizada a gestão de configuração do projeto via GitHub.
>
> Coloque detalhes sobre o processo de Design Thinking e a implementação do Framework Scrum seguido pelo grupo. O grupo poderá fazer uso de ferramentas on-line para acompanhar o andamento do projeto, a execução das tarefas e o status de desenvolvimento da solução.
>
> **Orientações**:
>
> - [Sobre Projects - GitHub Docs](https://docs.github.com/pt/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
> - [Gestão de projetos com GitHub | balta.io](https://balta.io/blog/gestao-de-projetos-com-github)
> - [(460) GitHub Projects - YouTube](https://www.youtube.com/playlist?list=PLiO7XHcmTsldZR93nkTFmmWbCEVF_8F5H)
> - [11 Passos Essenciais para Implantar Scrum no seu Projeto](https://mindmaster.com.br/scrum-11-passos/)
> - [Scrum em 9 minutos](https://www.youtube.com/watch?v=XfvQWnRgxG0)

# Solução Implementada

Esta seção apresenta todos os detalhes da solução criada no projeto.

## Vídeo do Projeto

O vídeo a seguir traz uma apresentação do problema que a equipe está tratando e a proposta de solução. ⚠️ EXEMPLO ⚠️

[![Vídeo do projeto](images/video.png)](https://www.youtube.com/embed/70gGoFyGeqQ)

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> O video de apresentação é voltado para que o público externo possa conhecer a solução. O formato é livre, sendo importante que seja apresentado o problema e a solução numa linguagem descomplicada e direta.
>
> Inclua um link para o vídeo do projeto.

## Funcionalidades

Esta seção apresenta as funcionalidades da solução.Info

##### Funcionalidade 1 - Cadastro de Contatos ⚠️ EXEMPLO ⚠️

Permite a inclusão, leitura, alteração e exclusão de contatos para o sistema

- **Instruções de acesso:**
  - Abra o site e efetue o login
  - Acesse o menu principal e escolha a opção Cadastros
  - Em seguida, escolha a opção Contatos
- **Tela da funcionalidade**:

![Tela de Funcionalidade](images/exemplo-funcionalidade.png)

- **Estrutura de dados:** ⚠️ EXEMPLO ⚠️

Contatos da aplicação

```json
{
  "id": 1,
  "nome": "Leanne Graham",
  "cidade": "Belo Horizonte",
  "categoria": "amigos",
  "email": "Sincere@april.biz",
  "telefone": "1-770-736-8031",
  "website": "hildegard.org"
}
```

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente cada uma das funcionalidades que a aplicação fornece tanto para os usuários quanto aos administradores da solução.
>
> Inclua, para cada funcionalidade, itens como: (1) titulos e descrição da funcionalidade; (2) Estrutura de dados associada; (3) o detalhe sobre as instruções de acesso e uso.

## Módulos e APIs

Esta seção apresenta os módulos e APIs utilizados na solução

| Propósito   | Plataforma      | Link                                                               |
| :---------- | :-------------- | :----------------------------------------------------------------- |
| **Images**  | Unsplash        | [https://unsplash.com/](https://unsplash.com/) ⚠️ EXEMPLO ⚠️       |
| **Fonts**   | Icons Font Face | [https://fontawesome.com/](https://fontawesome.com/) ⚠️ EXEMPLO ⚠️ |
| **Scripts** | jQuery          | [http://www.jquery.com/](http://www.jquery.com/) ⚠️ EXEMPLO ⚠️     |
| **Scripts** | Bootstrap 4     | [http://getbootstrap.com/](http://getbootstrap.com/) ⚠️ EXEMPLO ⚠️ |

> ⚠️ **APAGUE ESSA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente os módulos e APIs utilizados no desenvolvimento da solução. Inclua itens como: (1) Frameworks, bibliotecas, módulos, etc. utilizados no desenvolvimento da solução; (2) APIs utilizadas para acesso a dados, serviços, etc.

# Referências

As referências utilizadas no trabalho foram:

- NEGÓCIOS SC. *Entenda o impacto dos preços nas compras de supermercado*. Florianópolis, 01 out. 2024. Disponível em: <https://www.negociossc.com.br/blog/entenda-o-impacto-dos-precos-nas-compras-de-supermercado/>. Acesso em: 08 dez. 2025.

- ASSOCIAÇÃO PAULISTA DE SUPERMERCADOS – APAS. *71% dos brasileiros mudaram seus hábitos de compra em um ano, aponta APAS*. São Paulo, 06 jun. 2025. Disponível em: <https://apas.com.br/71-dos-brasileiros-mudaram-seus-habitos-de-compra-em-um-ano-aponta-apas/>. Acesso em: 08 dez. 2025.

- CHALEGRA, Jessica. *Consumidor brasileiro: entre preços e comportamentos no supermercado*. Consumidor Moderno, 07 mar. 2024. Disponível em: <https://consumidormoderno.com.br/consumidor-brasileiro-supermercado/>. Acesso em: 08 dez. 2025.

- INSTITUTO BRASILEIRO DE GEOGRAFIA E ESTATÍSTICA – IBGE. *POF 2024-2025 – Pesquisa de Orçamentos Familiares*. Disponível em: <https://www.ibge.gov.br/pof2024/>. Acesso em: 08 dez. 2025.

- NEOGRID; OPINION BOX. *Hábitos de compra no varejo alimentar*. jun. 2024. Disponível em: <https://hub.neogrid.com/hubfs/neogrid_opinion-box_relatorio_habitos-de-compra-varejo-alimentar_2024_v3.pdf?hsLang=en>. Acesso em: 08 dez. 2025.

- SCANNTECH. *Perfil de consumo nos supermercados brasileiros muda em 2025*. São Paulo, 21 maio 2025. Disponível em: <https://www.scanntech.com.br/perfil-consumo-supermercados-2025-2/>. Acesso em: 08 dez. 2025.

- EM TEMPO. *Serasa: 59% das dívidas de cartão de crédito são de compras em supermercados*. 13 nov. 2023. Disponível em: <https://emtempo.com.br/191618/economia/serasa-59-das-dividas-de-cartao-de-credito-sao-de-compras-em-supermercados/>. Acesso em: 08 dez. 2025.

- GB NEWS. *Pesquisa inédita revela hábito de compra dos consumidores*. 23 nov. 2020. Disponível em: <https://www.gbnews.com.br/single-post/2020/11/23/pesquisa-in%C3%A9dita-revela-h%C3%A1bito-de-compra-consumidores>. Acesso em: 08 dez. 2025.

- NEOGRID. *Brasileiros gastaram 19,7% a mais nos supermercados em 2023, aponta levantamento exclusivo da Neogrid*. 26 fev. 2024. Disponível em: <https://www.neogrid.com/noticias/panorama-bens-de-consumo/>. Acesso em: 08 dez. 2025.

- ASSERJ – ASSOCIAÇÃO DE SUPERMERCADOS DO ESTADO DO RIO DE JANEIRO. *Consumo em supermercados supera 15% de crescimento em 2023, aponta pesquisa*. 23 jan. 2024. Disponível em: <https://asserj.com.br/pt/w/consumo-em-supermercados-superam-15-de-crescimento-em-2023-aponta-pesquisa>. Acesso em: 08 dez. 2025.

- MOTA, Gabriel da. *59% das dívidas de brasileiros no cartão de crédito são com supermercado, diz Serasa*. O Liberal, 02 jan. 2024. Disponível em: <https://www.oliberal.com/economia/59-dos-brasileiros-se-endividam-no-cartao-de-credito-com-supermercado-diz-serasa-1.763079>. Acesso em: 08 dez. 2025.

- GRUPO REPÓRTER. *Consumo em supermercados no Brasil cresce 4% em julho de 2025*. 22 ago. 2025. Disponível em: <https://gruporeporter.com.br/consumo-em-supermercados-no-brasil-cresce-4-em-julho-de-2025/>. Acesso em: 08 dez. 2025.

- CNN BRASIL. *Supermercados faturam R$ 1 tri em 2024, equivalente a 9% do PIB, diz Abras*. 15 abr. 2025. Disponível em: <https://www.cnnbrasil.com.br/economia/negocios/supermercados-faturam-r-1-tri-em-2024-equivalente-a-9-do-pib-diz-abras/>. Acesso em: 08 dez. 2025.
