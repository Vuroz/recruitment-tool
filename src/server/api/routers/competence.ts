import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getAllCompetences } from "@/server/logic/competenceService";

export const competenceRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return getAllCompetences(ctx.db);
  }),
});
