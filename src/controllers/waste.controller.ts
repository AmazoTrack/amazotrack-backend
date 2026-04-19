import { Request, Response} from "express";
import { prisma} from "../lib/prisma";
import {
    createWasteSchema,
    updateWasteSchema
} from "../schemas/waste.schema";
import { classifyWaste } from "../utils/wasteClassifier";
import { error } from "node:console";

export class WasteController {
    static async create(req: Request, res: Response) {
        try {
            const data = createWasteSchema.parse(req.body);

            const waste = await prisma.waste.create({
                data: {
                    code: data.code,
                    description: data.description,
                    quantity: data.quantity,
                    unit: data.unit,
                    sector: data.sector,
                    companyId: data.companyId,
                    userId: req.userId as number,
                    
                    class: classifyWaste(data.description),
                    status: "gerado"
                }
            });
            

            return res.status(201).json(waste);

        } catch (error: any) {
            console.error(error);

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
        try {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 20);
            const skip = (page - 1) * limit;

            const wasteClass = req.query.class as string;
            const status = req.query.status as string;
            const sector = req.query.sector as string;

            const where: any = {
                deletedAt: null
            };

            if (wasteClass) {
                where.class = wasteClass;
            }

            if (status) {
                where.class = status;
            }
            if (sector) {
                where.sector = {
                    contains: sector,
                    mode: "insensitive"
                };
            }

            const [data, total] = await Promise.all([
                prisma.waste.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: "desc"
                    }
                }),
                prisma.waste.count({ where })
            ]);

            return res.status(200).json({
                data,
                total,
                page,
                limit
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: true,
                message: "Erro interno",
                details: []
            });
        }
    }
    

    static async findById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if(isNaN(id)) {
                return res.status(404).json({
                    error: true,
                    message: "Resíduo não encontrado",
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

            return res.status(200).json(waste);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: true,
                message: "Erro interno",
                details: []
            });
        }
    }


   static async update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(404).json({
        error: true,
        message: "Resíduo não encontrado",
        details: []
      });
    }

    if ("status" in req.body) {
      return res.status(400).json({
        error: true,
        message: "Não é permitido alterar o status",
        details: []
      });
    }

    const exists = await prisma.waste.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!exists) {
      return res.status(404).json({
        error: true,
        message: "Resíduo não encontrado",
        details: []
      });
    }

    const data = updateWasteSchema.parse(req.body);

    const updateData: any = {
        ...data
    };

    if (data.description) {
        updateData.class = classifyWaste(data.description);
    }

    const waste = await prisma.waste.update({
        where: { id },
        data: updateData
    });

    return res.status(200).json(waste);

  } catch (error: any) {
    console.error(error);

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

    static async remove(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(404).json({
                    error: true,
                    message: "Resíduo não encontrado",
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

            const movements = await prisma.movement.count({
                where: { wasteId: id }
            });

            if (movements > 0) {
                return res.status(409).json({
                    error: true,
                    message: "Resíduo possui movimentações - não pode ser excluído",
                    details: []
                });
            }


            await prisma.waste.update({
                where: { id },
                data: {
                    deletedAt: new Date()
                }
            });

            return res.status(200).json({
                error: false,
                message: "Resíduo excluído com sucesso"
            });

        } catch (error: any) {
            console.error(error);

            return res.status(500).json({
                error: true,
                message: "Erro interno",
                details: []
            });
        }
    }
}


