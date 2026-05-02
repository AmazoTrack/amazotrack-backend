import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createMovementSchema } from "../schemas/movement.schemas";

export class MovementController {

  static async create(req: Request, res: Response) {
    try {
      const body = createMovementSchema.parse(req.body);

      const waste = await prisma.waste.findUnique({
        where: { id: body.wasteId }
      });

      if (!waste) {
        return res.status(404).json({
          error: true,
          message: "Resíduo não encontrado",
          details: []
        });
      }

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

      const movement = await prisma.movement.create({
        data: {
          wasteId: body.wasteId,
          companyId: body.companyId,
          type: body.type,
          notes: body.notes
        }
      });

      await prisma.waste.update({
        where: { id: body.wasteId },
        data: {
          status: body.type
        }
      });

      return res.status(201).json(movement);

    } catch (error: any) {

      if (error.errors) {
        return res.status(400).json({
          error: true,
          message: "Dados inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro interno",
        details: []
      });
    }
  }

  static async list(req: Request, res: Response) {
    const movements = await prisma.movement.findMany();
    return res.json(movements);
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
      where: { id }
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
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "ID inválido",
        details: []
      });
    }

    const exists = await prisma.movement.findUnique({
      where: { id }
    });

    if (!exists) {
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
  }
}