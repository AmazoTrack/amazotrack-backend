
import { Request, Response } from "express";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";

import {
  createWasteSchema,
  updateWasteSchema
} from "../schemas/waste.schema";

export class WasteController {

  static async create(req: Request, res: Response) {

    try {

      const body = createWasteSchema.parse(req.body);

      const waste = await prisma.waste.create({
        data: {
          ...body,
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

  static async list(req: Request, res: Response) {

    const wastes = await prisma.waste.findMany({
      where: {
        deletedAt: null
      }
    });

    return res.json(wastes);
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

      const body = updateWasteSchema.parse(req.body);

      const waste = await prisma.waste.update({
        where: {
          id
        },
        data: body
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

      await prisma.waste.update({
        where: {
          id
        },
        data: {
          deletedAt: new Date()
        }
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