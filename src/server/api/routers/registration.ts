import { registrationSchema } from "@/validation/registration";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { createUser } from "@/server/logic/registrationService";

export const registrationRouter = createTRPCRouter({
    register: publicProcedure
        .input(registrationSchema)
        .mutation(async ({ ctx, input }) => {
            return createUser(ctx.db,
                input.fname,
                input.lname,
                input.email,
                input.pnr,
                input.username,
                input.password
            );
        }),
});