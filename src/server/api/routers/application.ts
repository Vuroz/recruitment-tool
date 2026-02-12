import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { getUserApplications } from "@/server/logic/applicationService";

export const applicationRouter = createTRPCRouter({
    userApplications: protectedProcedure
        .query(async ({ ctx }) => {
            if (!ctx.session.user.username) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Missing username"
                })
            }

            return getUserApplications(ctx.db, ctx.session.user.username || "");
        })
});