
import { Request, Response } from "express";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { createMovementSchema } from "../schemas/movement.schemas";

export class MovementController {

  static async create(req: Request, res: Response) {

    try {

      const body = createMovementSchema.parse(req.body);

      const movement = await prisma.movement.create({
        data: {
          wasteId: body.wasteId,
          companyId: body.companyId,
          type: body.type,
          notes: body.notes
        }
      });

      await prisma.waste.update({
        where: {
          id: body.wasteId
        },
        data: {
          status: body.type
        }
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

    try {

      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: true,
          message: "ID inválido",
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