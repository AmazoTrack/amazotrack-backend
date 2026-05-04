import { Express, Request, Response } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "AMAZOTRACK API",
    version: "2.0.0",
    description:
      "API para gestão de resíduos sólidos industriais do Polo Industrial de Manaus (PIM). " +
      "Classificação conforme NBR 10004, rastreabilidade do ciclo de vida e geração de MTR.\n\n" +
      "**Projeto acadêmico** — Inov@tech 2026, Centro Universitário Fametro.",
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
    { name: "Companies", description: "Cadastro de empresas geradoras e destinadoras" },
    { name: "Movements", description: "Movimentações no ciclo de vida dos resíduos" },
    { name: "Dashboard", description: "Dados agregados para os gráficos do painel" },
    { name: "MTR", description: "Manifesto de Transporte de Resíduos" },
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
      // ── Erro padrão ─────────────────────────────────────
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

      // ── Auth ────────────────────────────────────────────
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
              createdAt: { type: "string", format: "date-time" },
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

      // ── Enums ───────────────────────────────────────────
      CompanyType: {
        type: "string",
        enum: ["geradora", "destinadora"],
        description: "Tipo de empresa no ciclo de resíduos.",
      },
      WasteClass: {
        type: "string",
        enum: ["I", "II_A", "II_B"],
        description: "Classificação NBR 10004: I = Perigoso, II-A = Não-inerte, II-B = Inerte.",
      },
      WasteStatus: {
        type: "string",
        enum: ["gerado", "coletado", "transportado", "destinado"],
        description: "Ciclo de vida. Ordem obrigatória, sem reversão.",
      },

      // ── Wastes ──────────────────────────────────────────
      CreateWasteRequest: {
        type: "object",
        required: ["description", "quantity", "unit", "sector", "companyId"],
        properties: {
          code: { type: "string", nullable: true, example: "A001", description: "Código NBR 10004 (opcional)" },
          description: { type: "string", example: "Resíduo de solda eletrônica" },
          quantity: { type: "number", format: "float", example: 150.5 },
          unit: { type: "string", example: "kg" },
          sector: { type: "string", example: "Eletroeletrônico" },
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
          createdAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true, example: null },
          userId: { type: "integer", example: 1 },
          companyId: { type: "integer", example: 1 },
        },
      },
      UpdateWasteRequest: {
        type: "object",
        description: "Apenas campos descritivos. Tentar alterar 'status' retorna 400.",
        properties: {
          code: { type: "string", nullable: true, example: "A002" },
          description: { type: "string", example: "Resíduo de solda — atualizado" },
          quantity: { type: "number", example: 200.0 },
          unit: { type: "string", example: "kg" },
          sector: { type: "string", example: "Metalúrgico" },
          class: { $ref: "#/components/schemas/WasteClass" },
        },
      },
      WasteListResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/WasteResponse" } },
          total: { type: "integer", example: 87 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
        },
      },

      // ── Companies ───────────────────────────────────────
      CreateCompanyRequest: {
        type: "object",
        required: ["corporateName", "cnpj", "type"],
        properties: {
          corporateName: { type: "string", example: "Eco Destinação LTDA" },
          cnpj: { type: "string", example: "12345678000199" },
          type: { $ref: "#/components/schemas/CompanyType" },
          licenseNumber: { type: "string", nullable: true, example: "LO-2023/882-A" },
          issuingAgency: { type: "string", nullable: true, example: "IPAAM" },
          licenseExpiry: { type: "string", format: "date-time", nullable: true, example: "2026-12-31T00:00:00.000Z" },
          acceptedWasteTypes: { type: "string", nullable: true, example: "I, II_A", description: "Tipos aceitos (destinadora)" },
          phone: { type: "string", nullable: true, example: "92999999999" },
          email: { type: "string", format: "email", nullable: true, example: "eco@empresa.com" },
        },
      },
      UpdateCompanyRequest: {
        type: "object",
        description: "Todos os campos são opcionais.",
        properties: {
          corporateName: { type: "string", example: "Eco Destinação LTDA" },
          cnpj: { type: "string", example: "12345678000199" },
          type: { $ref: "#/components/schemas/CompanyType" },
          licenseNumber: { type: "string", nullable: true },
          issuingAgency: { type: "string", nullable: true },
          licenseExpiry: { type: "string", format: "date-time", nullable: true },
          acceptedWasteTypes: { type: "string", nullable: true },
          phone: { type: "string", nullable: true, example: "92988888888" },
          email: { type: "string", format: "email", nullable: true },
        },
      },
      CompanyResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          corporateName: { type: "string", example: "Eco Destinação LTDA" },
          cnpj: { type: "string", example: "12345678000199" },
          type: { $ref: "#/components/schemas/CompanyType" },
          licenseNumber: { type: "string", nullable: true, example: "LO-2023/882-A" },
          issuingAgency: { type: "string", nullable: true, example: "IPAAM" },
          licenseExpiry: { type: "string", format: "date-time", nullable: true },
          acceptedWasteTypes: { type: "string", nullable: true },
          phone: { type: "string", nullable: true, example: "92999999999" },
          email: { type: "string", nullable: true, example: "eco@empresa.com" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ── Movements ───────────────────────────────────────
      CreateMovementRequest: {
        type: "object",
        required: ["wasteId", "companyId", "type"],
        properties: {
          wasteId: { type: "integer", example: 1, description: "ID do resíduo" },
          companyId: { type: "integer", example: 1, description: "ID da empresa responsável" },
          type: { $ref: "#/components/schemas/WasteStatus", description: "Novo estado do resíduo" },
          notes: { type: "string", nullable: true, example: "Coleta realizada às 14h" },
        },
      },
      MovementResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          wasteId: { type: "integer", example: 1 },
          companyId: { type: "integer", example: 1 },
          type: { $ref: "#/components/schemas/WasteStatus" },
          notes: { type: "string", nullable: true },
          date: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ── Dashboard ───────────────────────────────────────
      DashboardSummary: {
        type: "object",
        properties: {
          byClass: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", example: "Classe I" },
                value: { type: "integer", example: 23 },
              },
            },
          },
          bySector: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sector: { type: "string", example: "Eletroeletrônico" },
                total: { type: "integer", example: 31 },
              },
            },
          },
          byMonth: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string", example: "2026-01" },
                count: { type: "integer", example: 8 },
              },
            },
          },
        },
      },

      // ── MTR ─────────────────────────────────────────────
      CreateMTRRequest: {
        type: "object",
        required: ["wasteId", "destinationId", "transporter"],
        properties: {
          wasteId: { type: "integer", example: 1, description: "ID do resíduo (relação 1:1)" },
          destinationId: { type: "integer", example: 2, description: "ID da empresa destinadora" },
          transporter: { type: "string", example: "Elogística Transportes LTDA" },
        },
      },
      MTRResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          number: { type: "string", example: "MTR-2026-0001", description: "Número único gerado automaticamente" },
          transporter: { type: "string", example: "Elogística Transportes LTDA" },
          issueDate: { type: "string", format: "date-time" },
          wasteId: { type: "integer", example: 1 },
          destinationId: { type: "integer", example: 2 },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════
  //  PATHS
  // ════════════════════════════════════════════════════════
  paths: {
    // ── Auth ────────────────────────────────────────────
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

    // ── Wastes ──────────────────────────────────────────
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
          { in: "query", name: "sector", schema: { type: "string" }, description: "Filtrar por setor (case-insensitive)" },
        ],
        responses: {
          "200": { description: "Lista paginada de resíduos", content: { "application/json": { schema: { $ref: "#/components/schemas/WasteListResponse" } } } },
          "401": { description: "Token inválido ou expirado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Wastes"],
        summary: "Cadastrar novo resíduo",
        description: "Classe NBR é atribuída automaticamente com base na descrição. Status inicial: 'gerado'.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateWasteRequest" } } },
        },
        responses: {
          "201": { description: "Resíduo cadastrado", content: { "application/json": { schema: { $ref: "#/components/schemas/WasteResponse" } } } },
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
        description: "Tentar alterar 'status' retorna 400. Se a descrição mudar, a classe NBR é reclassificada automaticamente.",
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
        description: "Marca deletedAt. Retorna 409 se o resíduo tiver movimentações.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Resíduo excluído (soft delete)",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "boolean", example: false }, message: { type: "string", example: "Resíduo excluído com sucesso" } } } } },
          },
          "404": { description: "Resíduo não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "409": { description: "Resíduo possui movimentações", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // ── Companies ───────────────────────────────────────
    "/companies": {
      get: {
        tags: ["Companies"],
        summary: "Listar empresas",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de empresas cadastradas",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CompanyResponse" } } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Companies"],
        summary: "Cadastrar nova empresa",
        description: "Campos de licença são obrigatórios para destinadoras, opcionais para geradoras.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCompanyRequest" } } },
        },
        responses: {
          "201": { description: "Empresa criada", content: { "application/json": { schema: { $ref: "#/components/schemas/CompanyResponse" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/companies/{id}": {
      get: {
        tags: ["Companies"],
        summary: "Buscar empresa por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Empresa encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/CompanyResponse" } } } },
          "400": { description: "ID inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Empresa não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      put: {
        tags: ["Companies"],
        summary: "Editar empresa",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCompanyRequest" } } },
        },
        responses: {
          "200": { description: "Empresa atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/CompanyResponse" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Empresa não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Companies"],
        summary: "Remover empresa",
        description: "Hard delete. Falha se a empresa tiver resíduos ou movimentações vinculadas.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Empresa removida",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "boolean", example: false }, message: { type: "string", example: "Empresa removida com sucesso" } } } } },
          },
          "404": { description: "Empresa não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Erro ao remover (possível FK constraint)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // ── Movements ───────────────────────────────────────
    "/movements": {
      get: {
        tags: ["Movements"],
        summary: "Listar todas as movimentações",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de movimentações",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/MovementResponse" } } } },
          },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Movements"],
        summary: "Registrar movimentação",
        description: "Cria uma movimentação e atualiza o status do resíduo automaticamente. O tipo representa o novo estado (coletado, transportado, destinado).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMovementRequest" } } },
        },
        responses: {
          "201": { description: "Movimentação criada e status do resíduo atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/MovementResponse" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Resíduo ou empresa não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/movements/{id}": {
      get: {
        tags: ["Movements"],
        summary: "Buscar movimentação por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Movimentação encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/MovementResponse" } } } },
          "400": { description: "ID inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Movimentação não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Movements"],
        summary: "Excluir movimentação",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Movimentação removida",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "boolean", example: false }, message: { type: "string", example: "Movimentação removida com sucesso" } } } } },
          },
          "404": { description: "Movimentação não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // ── Dashboard ───────────────────────────────────────
    "/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Dados agregados para os 3 gráficos do painel",
        description: "Retorna contagem por classe NBR, por setor gerador e evolução mensal. Endpoint previsto para Semana 4.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dados de resumo", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardSummary" } } } },
          "401": { description: "Não autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    // ── MTR ─────────────────────────────────────────────
    "/mtr": {
      post: {
        tags: ["MTR"],
        summary: "Gerar MTR",
        description: "Cria um Manifesto de Transporte de Resíduos com número único gerado automaticamente. Relação 1:1 com resíduo. Endpoint previsto para Semana 4.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMTRRequest" } } },
        },
        responses: {
          "201": { description: "MTR gerado", content: { "application/json": { schema: { $ref: "#/components/schemas/MTRResponse" } } } },
          "400": { description: "Dados inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "409": { description: "Resíduo já possui MTR", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/mtr/{id}": {
      get: {
        tags: ["MTR"],
        summary: "Consultar MTR por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "MTR encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/MTRResponse" } } } },
          "404": { description: "MTR não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });

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
