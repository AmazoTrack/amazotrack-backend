import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import {
  createCompanySchema,
  updateCompanySchema
} from "../schemas/company.schemas";

export class CompanyController {

  static async create(req: Request, res: Response) {
    try {
      const data = createCompanySchema.parse(req.body);

      const company = await prisma.company.create({
        data
      });

      return res.status(201).json(company);

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
    const companies = await prisma.company.findMany();
    return res.json(companies);
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

    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      return res.status(404).json({
        error: true,
        message: "Empresa não encontrada",
        details: []
      });
    }

    return res.json(company);
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

      const exists = await prisma.company.findUnique({
        where: { id }
      });

      if (!exists) {
        return res.status(404).json({
          error: true,
          message: "Empresa não encontrada",
          details: []
        });
      }

      const data = updateCompanySchema.parse(req.body);

      const company = await prisma.company.update({
        where: { id },
        data
      });

      return res.json(company);

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
        message: "Erro ao atualizar empresa",
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

      const exists = await prisma.company.findUnique({
        where: { id }
      });

      if (!exists) {
        return res.status(404).json({
          error: true,
          message: "Empresa não encontrada",
          details: []
        });
      }

      await prisma.company.delete({
        where: { id }
      });

      return res.json({
        error: false,
        message: "Empresa removida com sucesso"
      });

    } catch {
      return res.status(500).json({
        error: true,
        message: "Erro ao remover empresa",
        details: []
      });
    }
  }
}