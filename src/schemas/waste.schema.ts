import { z } from "zod";

export const createWasteSchema  =z.object({
    code: z.string().optional(),
    description: z.string().min(3),
    quantity: z.number().positive(),
    unit: z.string().min(2),
    sector: z.string(),
    companyId: z.number()
});

export const updateWasteSchema = z.object({
    code: z.string().optional(),
    description: z.string().min(3).optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    sector: z.string().optional()
}).strict();  //impede campos extras, ex: status