import { Express, Request, Response } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "AMAZOTRACK API",
    version: "1.0.0",
    description:
      "API para gestão de resíduos sólidos industriais do Polo Industrial de Manaus (PIM). " +
      "Classificação conforme NBR 10004, rastreabilidade do ciclo de vida e geração de MTR.",
    contact: {
      name: "Pedro Paulo Margarido — Tech Lead",
    },
  },
  
  servers: [
    {
      url: "http://localhost:3000",
      description: "Desenvolvimento local",
    },
    {
      url: "https://amazotrack-backend-production.up.railway.app",
      description: "Produção (Railway)",
    },
],

  tags: [
    { name: "Auth", description: "Registro e login de usuários" },
    { name: "Wastes", description: "CRUD de resíduos industriais" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT retornado pelo POST /auth/login. Expira em 8h.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "boolean", example: true },
          message: { type: "string", example: "Texto legível do erro" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "E-mail inválido" },
              },
            },
          },
        },
        required: ["error", "message", "details"],
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, example: "João Silva" },
          email: { type: "string", format: "email", example: "joao@empresa.com" },
          password: { type: "string", minLength: 6, example: "senhaSegura123" },
        },
      },
      RegisterResponse: {
        type: "object",
        properties: {
          error: { type: "boolean", example: false },
          message: { type: "string", example: "Usuário criado com sucesso" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "João Silva" },
              email: { type: "string", example: "joao@empresa.com" },
              createdAt: { type: "string", format: "date-time", example: "2026-04-14T21:00:00.000Z" },
            },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "joao@empresa.com" },
          password: { type: "string", example: "senhaSegura123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
        },
      },
      WasteClass: {
        type: "string",
        enum: ["I", "II_A", "II_B"],
        description: "Classificação NBR 10004: I = Perigoso, II-A = Não-inerte, II-B = Inerte",
      },
      WasteStatus: {
        type: "string",
        enum: ["gerado", "coletado", "transportado", "destinado"],
        description: "Ciclo de vida. Ordem obrigatória, sem reversão.",
      },
      CreateWasteRequest: {
        type: "object",
        required: ["description", "quantity", "unit", "sector", "class", "companyId"],
        properties: {
          code: { type: "string", nullable: true, example: "A001", description: "Código NBR 10004 (opcional)" },
          description: { type: "string", example: "Resíduo de solda eletrônica" },
          quantity: { type: "number", format: "float", example: 150.5 },
          unit: { type: "string", example: "kg" },
          sector: { type: "string", example: "Eletroeletrônico" },
          class: { $ref: "#/components/schemas/WasteClass" },
          companyId: { type: "integer", example: 1, description: "ID da empresa geradora" },
        },
      },
      WasteResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          code: { type: "string", nullable: true, example: "A001" },
          description: { type: "string", example: "Resíduo de solda eletrônica" },
          quantity: { type: "number", example: 150.5 },
          unit: { type: "string", example: "kg" },
          sector: { type: "string", example: "Eletroeletrônico" },
          class: { $ref: "#/components/schemas/WasteClass" },
          status: { $ref: "#/components/schemas/WasteStatus" },
          createdAt: { type: "string", format: "date-time", example: "2026-04-15T10:30:00.000Z" },
          deletedAt: { type: "string", format: "date-time", nullable: true, example: null },
          userId: { type: "integer", example: 1 },
          companyId: { type: "integer", example: 1 },
        },
      },
      UpdateWasteRequest: {
        type: "object",
        description: "Apenas campos descritivos são editáveis. Tentar alterar 'status' retorna 400.",
        properties: {
          code: { type: "string", nullable: true, example: "A002" },
          description: { type: "string", example: "Resíduo de solda — atualizado" },
          quantity: { type: "number", example: 200.0 },
          unit: { type: "string", example: "kg" },
          sector: { type: "string", example: "Metalúrgico" },
          class: { $ref: "#/components/schemas/WasteClass" },
        },
      },
    },
  },

  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar novo usuário",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: {
          "201": { description: "Usuário criado com sucesso", content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterResponse" } } } },
          "400": { description: "E-mail já cadastrado ou dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login — retorna JWT (8h de validade)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          "200": { description: "Token JWT gerado", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
          "401": { description: "Credenciais inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/wastes": {
      get: {
        tags: ["Wastes"],
        summary: "Listar resíduos (paginado)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 }, description: "Número da página" },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 }, description: "Itens por página" },
          { in: "query", name: "class", schema: { $ref: "#/components/schemas/WasteClass" }, description: "Filtrar por classe NBR" },
          { in: "query", name: "status", schema: { $ref: "#/components/schemas/WasteStatus" }, description: "Filtrar por status" },
          { in: "query", name: "sector", schema: { type: "string" }, description: "Filtrar por setor industrial" },
        ],
        responses: {
          "200": {
            description: "Lista paginada de resíduos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/WasteResponse" } },
                    total: { type: "integer", example: 87 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 20 },
                  },
                },
              },
            },
          },
          "401": { description: "Token inválido ou expirado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Wastes"],
        summary: "Cadastrar novo resíduo",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateWasteRequest" } } },
        },
        responses: {
          "201": { description: "Resíduo cadastrado (status inicial: gerado)", content: { "application/json": { schema: { $ref: "#/components/schemas/WasteResponse" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/wastes/{id}": {
      get: {
        tags: ["Wastes"],
        summary: "Buscar resíduo por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Resíduo encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/WasteResponse" } } } },
          "404": { description: "Resíduo não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      put: {
        tags: ["Wastes"],
        summary: "Editar resíduo (apenas campos descritivos)",
        description: "Edita código, descrição, quantidade, unidade, setor e classe. Tentar alterar 'status' retorna 400.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateWasteRequest" } } },
        },
        responses: {
          "200": { description: "Resíduo atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/WasteResponse" } } } },
          "400": { description: "Tentativa de alterar status ou dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Resíduo não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Wastes"],
        summary: "Excluir resíduo (soft delete)",
        description: "Marca deleted_at. Retorna 409 se o resíduo tiver movimentações registradas.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Resíduo excluído (soft delete)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "boolean", example: false },
                    message: { type: "string", example: "Resíduo excluído com sucesso" },
                  },
                },
              },
            },
          },
          "409": { description: "Resíduo possui movimentações — não pode ser excluído", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Resíduo não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  // Endpoint que serve o JSON da spec
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

  // Página HTML que carrega o Swagger UI via CDN
  app.get("/api-docs", (_req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>AMAZOTRACK API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/api-docs.json",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
    });
  </script>
</body>
</html>
    `);
  });
}
