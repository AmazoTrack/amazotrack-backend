import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class DashboardController {

  static async summary(req: Request, res: Response) {

    const totalWastes = await prisma.waste.count();

    const totalCompanies = await prisma.company.count();

    const totalMovements = await prisma.movement.count();

    const wastesByStatus = await prisma.waste.groupBy({
      by: ["status"],
      _count: true
    });

    const wastesByClass = await prisma.waste.groupBy({
      by: ["class"],
      _count: true
    });

    return res.json({
      totals: {
        wastes: totalWastes,
        companies: totalCompanies,
        movements: totalMovements
      },

      wastesByStatus,

      wastesByClass
    });
  }
}