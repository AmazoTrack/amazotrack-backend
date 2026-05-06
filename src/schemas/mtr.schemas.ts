import { z } from "zod";
 
export const createMtrSchema = z.object({
  number: z.string(),
  transporter: z.string(),
  wasteId: z.coerce.number(),
  destinationId: z.coerce.number()
});