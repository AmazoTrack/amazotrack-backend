import { z } from "zod";

export const createMovementSchema = z.object({
  wasteId: z.coerce.number(),
  companyId: z.coerce.number(),

  type: z.enum([
    "gerado",
    "coletado",
    "transportado",
    "destinado"
  ]),

  notes: z.string().optional()
});