import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getAvailabilityByUserId, addAvailabilityByUserId, removeAvailabilityById } from "@/server/logic/availabilityService";
import { availabilityIdSchema, availabilitySchema } from "@/validation/availability";


export const availabilityRouter = createTRPCRouter({
    getUserAvailability: protectedProcedure
    .query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        return getAvailabilityByUserId(ctx.db, userId);
    }),

    addAvailability: protectedProcedure
    .input(availabilitySchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        try {
            return addAvailabilityByUserId(ctx.db, userId, input);
        } catch (error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add availability" });
        }
    }),

    removeAvailability: protectedProcedure
    .input(availabilityIdSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
        }

        try {
            return removeAvailabilityById(ctx.db, userId, input);
        } catch (error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove availability" });
        }
    }),
});
