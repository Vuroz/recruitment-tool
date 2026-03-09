import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getAllCompetences } from "@/server/logic/competenceService";

/** Router exposing read-only competence lookups for authenticated users. */
export const competenceRouter = createTRPCRouter({
  /** Returns all competences selectable in the application form. */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return getAllCompetences(ctx.db);
  }),
});
