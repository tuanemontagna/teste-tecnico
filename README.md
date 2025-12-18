# Biblioteca API — Guia de Uso

API para gerenciamento de biblioteca (usuários, livros, empréstimos e parâmetros do sistema) com autenticação via JWT, documentação Swagger e testes automatizados.

## Instalação
```bash
npm install
```

## Configuração (.env)
Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo. Ajuste conforme seu ambiente:
```ini
API_PORT=
JWT_SECRET=
POSTGRES_DB=
POSTGRES_USERNAME=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_PORT=
```

## Executando 
```js
    npm run dev
```
O servidor inicia em `http://localhost:${API_PORT}`.

## Autenticação
- Faça login em `POST /auth/login` com `{ email, password }` para receber um token JWT.
- Envie o cabeçalho `Authorization: Bearer <token>` em todas as rotas protegidas.

## Documentação (Swagger)
Acesse a documentação interativa em:
- `http://localhost:${API_PORT}/docs`

## Testes automatizados
Execute a suíte de testes (Jest + Supertest):
```bash
npm test
```


