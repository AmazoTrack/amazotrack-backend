import { z } from "zod";
 
export const createMtrSchema = z.object({

  transporter: z.string(),

  wasteId: z.coerce.number(),

  destinationId: z.coerce.number()

});
 