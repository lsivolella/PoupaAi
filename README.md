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

Para testar esta aplicação localmente, você precisará do **Node.js** e do **JSON Server**, que é usado como API REST simulada. Siga os passos abaixo:

---

### 1. Instalar o Node.js

Se ainda não tiver instalado, baixe e instale pela página oficial:

https://nodejs.org

---

### 2. Inicializar o projeto (caso ainda não exista um package.json)

No diretório raiz do projeto, execute:

```bash
npm init -y
```

Isso criará o arquivo package.json, necessário para gerenciar dependências.

### 3. Instalar o JSON Server

Com o arquivo package.json criado, instale o JSON Server:

```bash
npm install json-server
```

Execute o servidor apontando para o arquivo db.json:

```bash
npx json-server --watch data/db.json --port 3001
```

Após iniciar, a API estará disponível em:

```bash
http://localhost:3001
```

### 4. Instalar o Live Server

Procure pela extensão do Live Server na loja de extensão e faça a sua instalação.

### 5. Testar a aplicação

Abra qualquer arquivo HTML utilizando o Live Server. Você será capaz de navegar na aplicação e testar todas as funcionalidades.
