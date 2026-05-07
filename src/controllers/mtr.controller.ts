
import { Request, Response } from "express";
import { ZodError } from "zod";

import { prisma } from "../lib/prisma";
import { createMtrSchema } from "../schemas/mtr.schemas";

export class MtrController {

  static async create(req: Request, res: Response) {

    try {

      const body = createMtrSchema.parse(req.body);

      // 🔍 verifica se waste existe
      const waste = await prisma.waste.findUnique({
        where: {
          id: body.wasteId
        }
      });

      if (!waste) {
        return res.status(404).json({
          error: true,
          message: "Resíduo não encontrado",
          details: []
        });
      }

      // 🔍 verifica se já possui MTR
      const existingMtr = await prisma.mTR.findUnique({
        where: {
          wasteId: body.wasteId
        }
      });

      if (existingMtr) {
        return res.status(409).json({
          error: true,
          message: "Este resíduo já possui um MTR",
          details: []
        });
      }

      // 🔍 verifica empresa
      const company = await prisma.company.findUnique({
        where: {
          id: body.destinationId
        }
      });

      if (!company) {
        return res.status(404).json({
          error: true,
          message: "Empresa destinadora não encontrada",
          details: []
        });
      }

      // 📅 ano atual
      const year = new Date().getFullYear();

      // 🔢 último MTR
      const lastMtr = await prisma.mTR.findFirst({
        orderBy: {
          id: "desc"
        }
      });

      let sequence = 1;

      if (lastMtr) {
        sequence = lastMtr.id + 1;
      }

      // 🧾 gera número
      const number = `MTR-${year}-${String(sequence).padStart(4, "0")}`;

      // ✅ cria
      const mtr = await prisma.mTR.create({
        data: {
          number,
          transporter: body.transporter,
          wasteId: body.wasteId,
          destinationId: body.destinationId
        }
      });

      return res.status(201).json(mtr);

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
        message: "Erro ao gerar MTR",
        details: []
      });
    }
  }

  static async list(req: Request, res: Response) {

    const mtrs = await prisma.mTR.findMany({
      include: {
        waste: true,
        destination: true
      }
    });

    return res.json(mtrs);
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

    const mtr = await prisma.mTR.findUnique({
      where: { id },
      include: {
        waste: true,
        destination: true
      }
    });

    if (!mtr) {
      return res.status(404).json({
        error: true,
        message: "MTR não encontrado",
        details: []
      });
    }

    return res.json(mtr);
  }
}