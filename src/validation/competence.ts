import { z } from "zod";

export const competenceApplicationSchema = z.object({
  competence_id: z.number().min(1, "Invalid competence ID").max(3, "Invalid competence ID"),
  years: z.number().min(0, "Years of experience must be at least 0"),
});

export type CompetenceApplicationValues = z.infer<
  typeof competenceApplicationSchema
>;
