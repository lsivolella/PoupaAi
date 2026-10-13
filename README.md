<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="codigo/public/assets/img/Logo_PoupaAI_Branco.svg">
    <img src="codigo/public/assets/img/Logo_PoupaAI.svg" alt="Logo do PoupaAí" width="300">
  </picture>
</p>

# PoupaAí

> 🏆 Este projeto foi eleito o **melhor projeto do 1º período** da turma de Engenharia de Software.

Uma plataforma voltada para ajudar consumidores a encontrarem os melhores preços nos mercados e a economizar seu tempo ao realizar compras.

## Alunos integrantes da equipe

- Bernardo Duarte Medeiros de Paula
- Bruna Pedrosa Nunes
- Lucas Gonçalves Sivolella
- Plínio Ângelo Ferreira
- Sofia Ferreira Costa
- Vinicius Ramos Sales

## Professores responsáveis

- Cleiton Silva Tavares
- Luiz Henrique da Costa Silva

## Instruções de utilização

A aplicação é composta por duas partes que rodam juntas:

| Parte | Onde fica | O que faz |
| :--- | :--- | :--- |
| **API** | `codigo/` | Um [JSON Server](https://github.com/typicode/json-server) que simula uma API REST a partir do arquivo `codigo/data/db.json`, na porta `3001` |
| **Front-end** | `codigo/public/` | Páginas HTML, CSS e JavaScript que consomem a API |

### Pré-requisitos

- **Node.js** (versão LTS): https://nodejs.org
- **Visual Studio Code** com a extensão **Live Server**, ou qualquer servidor de arquivos estáticos

### 1. Clonar o repositório

```bash
git clone https://github.com/lsivolella/PoupaAi.git
cd PoupaAi
```

### 2. Instalar as dependências

As dependências já estão declaradas em `codigo/package.json`, então não é necessário criar um novo projeto nem instalar o JSON Server manualmente:

```bash
cd codigo
npm install
```

### 3. Iniciar a API

Ainda dentro da pasta `codigo`, execute:

```bash
npm start
```

A API ficará disponível em:

```
http://localhost:3001
```

Mantenha este terminal aberto enquanto usa a aplicação, pois o front-end faz as requisições para essa porta.

### 4. Abrir o front-end

1. No Visual Studio Code, instale a extensão **Live Server** (caso ainda não a tenha).
2. Abra o arquivo `codigo/public/views/index.html`.
3. Clique com o botão direito no arquivo e escolha **Open with Live Server**.

### 5. Testar a aplicação

Navegue pelas páginas e teste as funcionalidades. Os dados de exemplo (usuários, mercados, produtos, listas e alertas) vêm de `codigo/data/db.json`.

> [!NOTE]
> O JSON Server grava no `db.json` as alterações feitas pela aplicação (cadastros, listas, avaliações etc.). Para restaurar os dados originais, desfaça as mudanças nesse arquivo com `git restore codigo/data/db.json`.
