import { registrationSchema } from "@/validation/registration";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { createUser } from "@/server/logic/registrationService";

/** Public registration router for new applicant accounts. */
export const registrationRouter = createTRPCRouter({
    /**
     * Registers a new user and initializes their default application state.
     */
    register: publicProcedure
        .input(registrationSchema)
        .mutation(async ({ ctx, input }) => {
            if (ctx.session) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You already have an account"
                })
            }
            
            try {
                return createUser(ctx.db, input);
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal server error",
                });
            }
        }),
});