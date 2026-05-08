import { z } from "zod";

// FIX: class removido do createSchema — é atribuído automaticamente pelo wasteClassifier
export const createWasteSchema = z.object({
  code: z.string().optional(),
  description: z.string().min(3, "Descrição obrigatória"),
  quantity: z.number().positive("Quantidade deve ser maior que zero"),
  unit: z.string().min(1, "Unidade obrigatória"),
  sector: z.string().min(2, "Setor obrigatório"),
  companyId: z.number()
});

// FIX: class usa enum real do Prisma, status explicitamente excluído
export const updateWasteSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  sector: z.string().optional(),
  class: z.enum(["I", "II_A", "II_B"]).optional()
});
