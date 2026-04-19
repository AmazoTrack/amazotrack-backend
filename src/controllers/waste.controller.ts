import { Request, Response} from "express";
import { prisma} from "../lib/prisma";
import {
    createWasteSchema,
    updateWasteSchema
} from "../schemas/waste.schema";
import { classifyWaste } from "../utils/wasteClassifier";

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

            return res.status(400).json({
                error: true,
                message: "Dados inválidos",
                details: error?.errors || error?.message || error
            });
        }
    }

    static async list(req: Request, res: Response) {
        const page = Number(req.query.page?? 1);
        const limit = Number(req.query.limit ?? 10);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.waste.findMany({
                where: { deletedAt: null },
                skip,
                take: limit,
                orderBy: { createdAt: "desc"}
            }),
            prisma.waste.count({
                where: { deletedAt: null }
            })
        ]);

        return res.json({
            page,
            limit,
            total,
            data: items
        });
    }

    static async findById(req: Request, res: Response) {
        const id = Number(req.params.id);

        const waste = await prisma.waste.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });

        if (!waste) {
            return res.status(400).json({
                error: true,
                message: "Resíduo não encontrado"
            });
        }

        return res.json(waste);
    }

    static async update(req: Request, res: Response) {
        try {
            if("statyus" in req.body) {
                return res.status(400).json({
                    error: true,
                    message: "Status não pode ser alterado nesta rota"
                });
            }

            const id = Number(req.params.id);
            const data = updateWasteSchema.parse(req.body);

            const waste = await prisma.waste.update({
                where: { id },
                data: {
                    ...data,
                    ...(data.description && {
                        class: classifyWaste(data.description)
                    })
                }
            });

            return res.json(waste);

        } catch (error: any) {
            return res.status(400).json({
                error: true,
                message: "Dados inválidos",
                details: error.errors ?? []
            });
        }
    }

    static async remove(req: Request, res: Response) {
        const id = Number(req.params.id);

        const movements = await prisma.movement.count({
            where:{ wasteId: id }
        });

        if (movements > 0) {
            return res.status(409).json({
                error: true,
                message: "Não é possível excluir resíduo com movimentações"
            });
        }

        await prisma.waste.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });

        return res.json({
            error: false,
            message: "Resíduo removido com sucesso"
        });
    }
}


