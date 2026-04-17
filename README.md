# AMAZOTRACK — Backend API

API para gestão de resíduos sólidos industriais do Polo Industrial de Manaus (PIM).  
Classificação conforme NBR 10004, rastreabilidade do ciclo de vida e geração de MTR.

**Projeto acadêmico** — Feira de Tecnologia, Centro Universitário Fametro (2026).

---

## Stack

| Camada         | Tecnologia                    |
| -------------- | ----------------------------- |
| Runtime        | Node.js + TypeScript          |
| Framework      | Express 5                     |
| Banco de dados | PostgreSQL via Prisma ORM     |
| Autenticação   | JWT (8h) + bcrypt             |
| Validação      | Zod                           |
| Documentação   | Swagger UI (OpenAPI 3.0)      |
| Deploy         | Railway                       |

---

## Como rodar localmente

### Pré-requisitos

- Node.js >= 18
- PostgreSQL rodando (local ou Docker)

### 1. Clonar e instalar

```bash
git clone https://github.com/AmazoTrack/amazotrack-backend.git
cd amazotrack-backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com sua `DATABASE_URL` e um `JWT_SECRET`.

### 3. Rodar as migrations

```bash
npx prisma migrate dev
```

### 4. Iniciar o servidors

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.  
Swagger UI fica disponível em `http://localhost:3000/api-docs`.

---

## Scripts disponíveis

| Comando         | Descrição                              |
| --------------- | -------------------------------------- |
| `npm run dev`   | Inicia o servidor em modo dev (hot reload) |
| `npm run build` | Compila TypeScript para `dist/`        |
| `npm start`     | Roda a versão compilada (produção)     |

---

## Estrutura do projeto

```
src/
├── server.ts              # Entrada: Express + CORS + Swagger + rotas
├── routes.ts              # Definição de rotas /api/v1/*
├── swagger.ts             # Configuração do Swagger UI (OpenAPI)
├── controllers/           # Lógica dos endpoints
│   └── auth.controller.ts
├── middlewares/            # Middleware JWT e outros
│   └── auth.middlewares.ts
└── lib/
    └── prisma.ts          # Singleton do PrismaClient
```

---

## Documentação da API

Acesse `/api-docs` para a interface Swagger com todos os endpoints, schemas e exemplos.

**Padrão de resposta de erro:**
```json
{ "error": true, "message": "Texto legível", "details": [] }
```

**Padrão de paginação (listagens):**
```json
{ "data": [...], "total": 87, "page": 1, "limit": 20 }
```

---

## Equipe Backend

| Nome     | Papel          |
| -------- | -------------- |
| Bianca   | Líder Backend  |
| Thalison | Desenvolvedor  |
| Danilo   | Desenvolvedor  |
| Vander   | Desenvolvedor  |
| Pedro    | Tech Lead      |
