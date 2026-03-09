import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getAvailabilityByUserId, addAvailabilityByUserId, removeAvailabilityById } from "@/server/logic/availabilityService";
import { availabilityIdSchema, availabilitySchema } from "@/validation/availability";

/** Router for managing applicant availability ranges. */
export const availabilityRouter = createTRPCRouter({
    /** Returns availability rows for the authenticated user. */
    getUserAvailability: protectedProcedure
    .query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        return getAvailabilityByUserId(ctx.db, userId);
    }),

    /** Validates and appends one availability period for the caller. */
    addAvailability: protectedProcedure
    .input(availabilitySchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        try {
            return addAvailabilityByUserId(ctx.db, userId, input);
        } catch {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add availability" });
        }
    }),

    /** Removes one availability period owned by the caller. */
    removeAvailability: protectedProcedure
    .input(availabilityIdSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        try {
            return removeAvailabilityById(ctx.db, userId, input);
        } catch {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove availability" });
        }
    }),
});
