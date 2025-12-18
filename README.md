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

## Endpoints principais
- `GET /loans` e `GET /loans/{id}`: listar/obter empréstimos (token).
- `POST /loans`: criar empréstimo (token).
- `GET /loans/{id}/preview`, `GET /loans/{id}/fine`, `GET /loans/{id}/rental`: cálculos de valores (token).
- `POST /loans/{id}/return`: devolver livro (admin).
- `PATCH /loans/{id}/discount`: aplicar desconto em 1º atraso (admin).
- `GET /loans/overdue`: listar empréstimos atrasados (admin).
- `GET /users/{id}/loans`: histórico de empréstimos por usuário (token; o próprio usuário ou admin).
- `GET /book/{id}/location`: localização do livro (setor/prateleira).
- CRUDs: perfis, setores, prateleiras, gêneros, usuários e parâmetros do sistema (alguns apenas admin).

## Exemplos rápidos
Substitua `PORT` pelo valor de `API_PORT` do `.env`.

- Login (obtenha o token):
```bash
curl -s -X POST http://localhost:PORT/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@local","password":"senha123"}'
```

- Listar empréstimos atrasados (admin):
```bash
curl -s http://localhost:PORT/loans/overdue \
    -H "Authorization: Bearer <TOKEN>"
```

- Histórico de empréstimos de um usuário (token):
```bash
curl -s http://localhost:PORT/users/123/loans \
    -H "Authorization: Bearer <TOKEN>"
```

- Localização de um livro:
```bash
curl -s http://localhost:PORT/book/1/location \
    -H "Authorization: Bearer <TOKEN>"
```

## Testes automatizados
Execute a suíte de testes (Jest + Supertest):
```bash
npm test
```


