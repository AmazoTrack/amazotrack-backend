import { Request, Response } from "express";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { createMovementSchema } from "../schemas/movement.schemas";

// FIX: ordem obrigatória do ciclo de vida (sem reversão)
const LIFECYCLE_ORDER = ["gerado", "coletado", "transportado", "destinado"] as const;

function isValidTransition(currentStatus: string, newStatus: string): boolean {
  const currentIndex = LIFECYCLE_ORDER.indexOf(currentStatus as any);
  const newIndex = LIFECYCLE_ORDER.indexOf(newStatus as any);

  // Só permite avançar exatamente um passo
  return newIndex === currentIndex + 1;
}

export class MovementController {

  static async create(req: Request, res: Response) {

    try {

      const body = createMovementSchema.parse(req.body);

      // Verifica se o resíduo existe
      const waste = await prisma.waste.findFirst({
        where: { id: body.wasteId, deletedAt: null }
      });

      if (!waste) {
        return res.status(404).json({
          error: true,
          message: "Resíduo não encontrado",
          details: []
        });
      }

      // Verifica se a empresa existe
      const company = await prisma.company.findUnique({
        where: { id: body.companyId }
      });

      if (!company) {
        return res.status(404).json({
          error: true,
          message: "Empresa não encontrada",
          details: []
        });
      }

      // FIX: valida ordem do ciclo de vida
      if (!isValidTransition(waste.status, body.type)) {
        return res.status(400).json({
          error: true,
          message: `Transição inválida: não é possível ir de "${waste.status}" para "${body.type}". ` +
                   `A ordem correta é: gerado → coletado → transportado → destinado.`,
          details: [{
            field: "type",
            message: `Status atual é "${waste.status}", próximo válido é "${LIFECYCLE_ORDER[LIFECYCLE_ORDER.indexOf(waste.status as any) + 1] || "nenhum (já finalizado)"}"`
          }]
        });
      }

      const movement = await prisma.movement.create({
        data: {
          wasteId: body.wasteId,
          companyId: body.companyId,
          type: body.type,
          notes: body.notes
        }
      });

      // Atualiza o status do resíduo
      await prisma.waste.update({
        where: { id: body.wasteId },
        data: { status: body.type }
      });

      return res.status(201).json(movement);

    } catch (error: any) {

      if (error instanceof ZodError) {

        return res.status(400).json({
          error: true,
          message: "Dados inválidos",
          details: error.issues.map((err) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro ao criar movimentação",
        details: []
      });
    }
  }

  // FIX: agora retorna formato paginado { data, total, page, limit }
  static async list(req: Request, res: Response) {

    try {

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const total = await prisma.movement.count();

      const movements = await prisma.movement.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          waste: { select: { id: true, description: true, status: true } },
          company: { select: { id: true, corporateName: true } }
        }
      });

      return res.json({
        data: movements,
        total,
        page,
        limit
      });

    } catch {

      return res.status(500).json({
        error: true,
        message: "Erro ao listar movimentações",
        details: []
      });
    }
  }

  static async findById(req: Request, res: Response) {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "ID inválido",
        details: []
      });
    }

    const movement = await prisma.movement.findUnique({
      where: { id },
      include: {
        waste: { select: { id: true, description: true, status: true } },
        company: { select: { id: true, corporateName: true } }
      }
    });

    if (!movement) {
      return res.status(404).json({
        error: true,
        message: "Movimentação não encontrada",
        details: []
      });
    }

    return res.json(movement);
  }

  static async remove(req: Request, res: Response) {

    try {

      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: "ID inválido",
          details: []
        });
      }

      const movement = await prisma.movement.findUnique({
        where: { id }
      });

      if (!movement) {
        return res.status(404).json({
          error: true,
          message: "Movimentação não encontrada",
          details: []
        });
      }

      await prisma.movement.delete({
        where: { id }
      });

      return res.json({
        error: false,
        message: "Movimentação removida com sucesso"
      });

    } catch {

      return res.status(500).json({
        error: true,
        message: "Erro ao remover movimentação",
        details: []
      });
    }
  }
}
