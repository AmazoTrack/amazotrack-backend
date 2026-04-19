# Contrato de API — AMAZOTRACK v1

> **Responsável:** Pedro Paulo Margarido (Tech Lead)  
> **Última atualização:** Abril 2026  
> **Status:** v1 (Auth + Wastes)

---

## Regras Gerais

### Prefixo

Todas as rotas usam o prefixo `/api/v1`.

```
POST /api/v1/auth/register
GET  /api/v1/wastes
```

### Autenticação

- JWT simples, 8h de validade, sem refresh token no MVP.
- Header: `Authorization: Bearer <token>`
- Se 401 → frontend redireciona para `/login`.
- Rotas públicas: `/auth/register`, `/auth/login`.
- Todas as demais rotas exigem token.

### Formato de resposta — Sucesso

Recurso individual:
```json
{
  "id": 1,
  "description": "Resíduo de solda",
  "class": "I",
  "status": "gerado"
}
```

Lista paginada (`GET /wastes`, `GET /companies`):
```json
{
  "data": [ ... ],
  "total": 87,
  "page": 1,
  "limit": 20
}
```

Query params de paginação: `?page=1&limit=20` (defaults: page=1, limit=20).

### Formato de resposta — Erro

Todas as respostas de erro seguem este formato:
```json
{
  "error": true,
  "message": "Texto legível para o usuário",
  "details": []
}
```

Erros de validação incluem detalhes por campo:
```json
{
  "error": true,
  "message": "Dados inválidos",
  "details": [
    { "field": "email", "message": "E-mail inválido" },
    { "field": "password", "message": "Mínimo 6 caracteres" }
  ]
}
```

### Códigos HTTP

| Situação                     | Código |
| ---------------------------- | ------ |
| Criação bem-sucedida         | 201    |
| Leitura/atualização OK       | 200    |
| Erro de validação            | 400    |
| Token inválido/expirado      | 401    |
| Recurso não encontrado       | 404    |
| Conflito de regra de negócio | 409    |
| Erro interno                 | 500    |

---

## Segurança

- **NUNCA** retornar `passwordHash` em nenhuma resposta.
- Validar todos os inputs com Zod antes de processar.
- Sanitizar dados antes de queries (Prisma já faz por padrão).

---

## Endpoints — v1

### Auth (público)

| Método | Rota              | Descrição              |
| ------ | ----------------- | ---------------------- |
| POST   | `/auth/register`  | Registrar novo usuário |
| POST   | `/auth/login`     | Login → retorna JWT    |

### Wastes (autenticado)

| Método | Rota           | Descrição                          |
| ------ | -------------- | ---------------------------------- |
| GET    | `/wastes`      | Listar resíduos (paginado)         |
| POST   | `/wastes`      | Cadastrar novo resíduo             |
| GET    | `/wastes/:id`  | Buscar resíduo por ID              |
| PUT    | `/wastes/:id`  | Editar campos descritivos          |
| DELETE | `/wastes/:id`  | Soft delete (marca `deletedAt`)    |

**Regras de negócio — Wastes:**
- `PUT /wastes/:id` — NÃO permite alterar `status`. Retorna 400 se tentar.
- `DELETE /wastes/:id` — Retorna 409 se o resíduo tiver movimentações.
- Status inicial de todo resíduo: `gerado`.

### Previsto para v2 (Semana 3)

| Método | Rota                        | Descrição                      |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/companies`                | Listar empresas (paginado)     |
| POST   | `/companies`                | Cadastrar empresa              |
| GET    | `/companies/:id`            | Buscar empresa por ID          |
| POST   | `/movements`                | Registrar movimentação         |
| GET    | `/movements/waste/:wasteId` | Histórico de um resíduo        |
| GET    | `/dashboard/summary`        | Dados para os 3 gráficos       |
| POST   | `/mtr`                      | Gerar MTR                      |
| GET    | `/mtr/:id`                  | Consultar MTR                  |

---

## Enums do banco

```
CompanyType: geradora | destinadora
WasteClass:  I | II_A | II_B
WasteStatus: gerado | coletado | transportado | destinado
```

---

## Swagger

Documentação interativa disponível em:
- **Local:** `http://localhost:3000/api-docs`
- **Railway:** `https://amazotrack-backend-production.up.railway.app/api-docs`
