import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { getUserApplications, getAllApplications } from "@/server/logic/applicationService";
import { isRecruiter } from "@/server/auth/roles";

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
        }),

    allApplications: protectedProcedure
        .query(async ({ ctx }) => {
            if (!isRecruiter(ctx.session.user.role)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only recruiters can view all applications"
                });
            }

            return getAllApplications(ctx.db);
        }),
});