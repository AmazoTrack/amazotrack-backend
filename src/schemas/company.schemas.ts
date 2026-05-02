import { z } from "zod";

export const createCompanySchema = z.object({
  corporateName: z.string().min(3, "Nome obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  type: z.enum(["geradora", "destinadora"]),

  licenseNumber: z.string().optional(),
  issuingAgency: z.string().optional(),
  licenseExpiry: z.coerce.date().optional(),

  acceptedWasteTypes: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional()
});

export const updateCompanySchema = createCompanySchema.partial();