import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { getUserApplications, getAllApplications } from "@/server/logic/applicationService";
import { isRecruiter } from "@/server/auth/roles";

/** Router for application-related queries (competence profiles). */
export const applicationRouter = createTRPCRouter({
    /** Returns competence profiles belonging to the currently logged-in user. */
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

    /** Returns all competence profiles across all users. Restricted to recruiters. */
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