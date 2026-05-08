import { Request, Response } from "express";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { classifyWaste } from "../utils/wasteClassifier"; // FIX: agora é usado

import {
  createWasteSchema,
  updateWasteSchema
} from "../schemas/waste.schema";

export class WasteController {

  static async create(req: Request, res: Response) {

    try {

      const body = createWasteSchema.parse(req.body);

      // FIX: classificação NBR automática a partir da descrição
      const wasteClass = classifyWaste(body.description);

      const waste = await prisma.waste.create({
        data: {
          code: body.code,
          description: body.description,
          quantity: body.quantity,
          unit: body.unit,
          sector: body.sector,
          class: wasteClass,
          companyId: body.companyId,
          userId: req.userId!
        }
      });

      return res.status(201).json(waste);

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
        message: "Erro ao criar resíduo",
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

      const total = await prisma.waste.count({
        where: { deletedAt: null }
      });

      const wastes = await prisma.waste.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { id: "desc" }
      });

      return res.json({
        data: wastes,
        total,
        page,
        limit
      });

    } catch {

      return res.status(500).json({
        error: true,
        message: "Erro ao listar resíduos",
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

    const waste = await prisma.waste.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!waste) {
      return res.status(404).json({
        error: true,
        message: "Resíduo não encontrado",
        details: []
      });
    }

    return res.json(waste);
  }

  static async update(req: Request, res: Response) {

    try {

      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: "ID inválido",
          details: []
        });
      }

      // FIX: bloqueia tentativa de alterar status via PUT
      if (req.body.status !== undefined) {
        return res.status(400).json({
          error: true,
          message: "Não é permitido alterar o status via PUT. Use POST /movements.",
          details: [{ field: "status", message: "Campo não permitido nesta rota" }]
        });
      }

      const body = updateWasteSchema.parse(req.body);

      // Verifica se o resíduo existe e não foi deletado
      const existing = await prisma.waste.findFirst({
        where: { id, deletedAt: null }
      });

      if (!existing) {
        return res.status(404).json({
          error: true,
          message: "Resíduo não encontrado",
          details: []
        });
      }

      // FIX: se a descrição mudou, reclassifica automaticamente
      const updateData: any = { ...body };
      if (body.description && body.description !== existing.description) {
        updateData.class = classifyWaste(body.description);
      }

      const waste = await prisma.waste.update({
        where: { id },
        data: updateData
      });

      return res.json(waste);

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
        message: "Erro ao atualizar resíduo",
        details: []
      });
    }
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

      // Verifica se o resíduo existe
      const waste = await prisma.waste.findFirst({
        where: { id, deletedAt: null }
      });

      if (!waste) {
        return res.status(404).json({
          error: true,
          message: "Resíduo não encontrado",
          details: []
        });
      }

      // FIX: verifica se há movimentações antes do soft delete
      const hasMovements = await prisma.movement.findFirst({
        where: { wasteId: id }
      });

      if (hasMovements) {
        return res.status(409).json({
          error: true,
          message: "Resíduo possui movimentações e não pode ser removido",
          details: []
        });
      }

      await prisma.waste.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      return res.json({
        error: false,
        message: "Resíduo removido com sucesso"
      });

    } catch {

      return res.status(500).json({
        error: true,
        message: "Erro ao remover resíduo",
        details: []
      });
    }
  }
}
