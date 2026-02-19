import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import { getUserApplications, getAllApplications, getApplicationByUserId, updateApplicationState, getApplicationStateByUserId } from "@/server/logic/applicationService";
import { isRecruiter } from "@/server/auth/roles";
import { applicationStateChangeSchema, userIdSchema } from "@/validation/recruiter";

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

    getApplicationByUserId: protectedProcedure
        .input(userIdSchema)
        .query(async ({ ctx, input }) => {
            if (!isRecruiter(ctx.session.user.role)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only recruiters can view applications by user ID"
                });
            }
            
            return getApplicationByUserId(ctx.db, input.user_id);
        }),

    updateUserApplicationState: protectedProcedure
        .input(applicationStateChangeSchema)
        .mutation(async ({ ctx, input }) => {
            if (!isRecruiter(ctx.session.user.role)) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only recruiters can update application states"
                });
            }
            // Get current application state and return error if updated_at from input differs from the one in the database (optimistic concurrency control)
            const dbApplicationState = await getApplicationStateByUserId(ctx.db, input.user_id);
            if (dbApplicationState && dbApplicationState.updated_at && dbApplicationState.updated_at.getTime() !== input.update_at?.getTime()) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Application has been updated since you last fetched it. Please refresh and try again."
                });
            }

            return updateApplicationState(ctx.db, input.user_id, input.new_state);
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