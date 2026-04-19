import { z } from "zod";

export const createWasteSchema  =z.object({
    code: z.string().optional(),
    description: z.string().min(3, "Descrição obrigatória"),
    quantity: z.number().positive("Quantidade deve ser maior que zero"),
    unit: z.string().min(1, "Unidade obrigatória"),
    sector: z.string().min(2, "Setor obrigatório"),
    class: z.string().optional(),
    companyId: z.number()
});

export const updateWasteSchema = z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    sector: z.string().optional(),
    class: z.string().optional()
});