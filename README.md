[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20612906)

# PoupaAí

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
npx json-server --watch db/db.json --port 3000
```

Após iniciar, a API estará disponível em:

```bash
http://localhost:3000
```

### 5. Testar a aplicação

Agora basta abrir o arquivo public/index.html no navegador para acessar a aplicação e testar todas as funcionalidades.