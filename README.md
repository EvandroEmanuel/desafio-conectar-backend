# NestJS User Management API

API desenvolvida com o framework NestJS, com foco em segurança, escalabilidade e boas práticas de arquitetura. Ela oferece funcionalidades completas para autenticação e autorização via JWT, gerenciamento de usuários com controle baseado em roles (`admin` e `user`), filtros globais reutilizáveis e documentação interativa por meio do Swagger.

Este repositório foi criado para o desafio técnico da Conectar e está disponível em: [https://github.com/EvandroEmanuel/desafio-conectar-backend](https://github.com/EvandroEmanuel/desafio-conectar-backend)

---

## ✨ Tecnologias Utilizadas

* **NestJS** — Framework Node.js modular e escalável
* **TypeORM** — ORM para banco de dados relacional
* **PostgreSQL** — Banco relacional robusto
* **JWT** — Autenticação via token
* **Swagger** — Documentação interativa
* **Docker (opcional)** — Containerização do ambiente

---

## 🧠 Decisões de Arquitetura

### ✅ Modularização

Estrutura modular organizada em pastas por contexto (`auth`, `users`, `utils`), permitindo manutenção e expansão fácil.

### ✅ Autenticação e Autorizacão

* JWT com `sub`, `name` e `role` no payload.
* Guardas personalizados: `AuthGuard` e `RolesGuard`.
* Acesso controlado via decorator `@Roles()`.

### ✅ Filtros Reutilizáveis

* `UtilsService.applyGlobalFilters()` centraliza filtros reutilizáveis: `search`, `isActive`, `startDate`, `finishDate`, `role`, `page`, `limit`.

### ✅ Padronização de Horário

* Datas ajustadas para o fuso horário de Brasília (UTC-3) com `toLocaleString`.

---

## ⚖️ Instalação e Execução

### 🔧 Requisitos

* Node.js >= 18
* PostgreSQL >= 13
* Docker (opcional)

### 📄 Clone o repositório

```bash
git clone https://github.com/EvandroEmanuel/desafio-conectar-backend.git
cd desafio-conectar-backend
```

### 📦 Instale as dependências

```bash
npm install
```

### ⚙️ Crie o arquivo `.env`

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/seubanco
JWT_SECRET=segredo_super_secreto
JWT_EXPIRATION_TIME=3600
```

### 📂 Rode as migrations

```bash
npm run migration:run
```

### ▶️ Inicie a aplicação

```bash
npm run start:dev
```

---

## 🔐 Autenticação e Autorizacão

### Login

* Rota: `POST /auth/login`
* Body:

```json
{
  "email": "admin@email.com",
  "password": "senha123"
}
```

* Retorno:

```json
{
  "token": "JWT_TOKEN",
  "expiresIn": 3600
}
```

### Controle de Acesso

* `@UseGuards(AuthGuard, RolesGuard)` para proteger rotas
* `@Roles('admin')` ou `@Roles('user')` define quem pode acessar

---

## 📄 Documentação Swagger

Documentação interativa disponível em:

[http://localhost:3000/api](http://localhost:3000/api)

* Testes com JWT direto na interface
* Modelos documentados (DTOs)
* Facilidade para exploradores de API

---

## 🔢 Testes Manuais

* Criar usuários via `POST /users`
* Logar via `POST /auth/login`
* Testar `GET /users` com token de admin
* Testar `GET /users/me` com token de user
* Testar `GET /users/inativos` para listar usuários sem login nos últimos 30 dias

---

## 📁 Estrutura do Projeto

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   ├── roles.guard.ts
│   └── auth.decorator.ts
│
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   └── entities/
│
├── utils/
│   └── utils.service.ts
│
├── main.ts
└── app.module.ts
```

---

## 📌 Endpoints Principais

| Método | Rota            | Descrição                              | Autenticação |
| ------ | --------------- | -------------------------------------- | ------------ |
| POST   | /auth/login     | Login e gera token                     | Não          |
| GET    | /users          | Lista todos os usuários (apenas admin) | Sim (admin)  |
| GET    | /users/me       | Perfil do próprio usuário              | Sim          |
| PATCH  | /users/me       | Atualiza perfil                        | Sim          |
| DELETE | /users/\:id     | Remove um usuário                      | Sim (admin)  |
| GET    | /users/inativos | Lista usuários inativos (>30 dias)     | Sim (admin)  |

---

## 🧑‍💻 Autor

**Evandro Emanoel** — Desenvolvedor Full Stack

[https://github.com/EvandroEmanuel](https://github.com/EvandroEmanuel)

---

## 🔖 Licença

Este projeto está licenciado sob a licença MIT. Sinta-se livre para usar e modificar.
