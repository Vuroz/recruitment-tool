import { resetPasswordRequestSchema, resetPasswordSchema, createResetPasswordTokenSchema } from "@/validation/resetPassword";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

import { getUserByToken, updateUsernamePassword, createPasswordResetToken } from "@/server/logic/resetPasswordService";
import { USER_ROLES } from "@/server/auth/roles";

export const resetPasswordRouter = createTRPCRouter({
    getUserDetails: publicProcedure
        .input(resetPasswordRequestSchema)
        .query(async ({ ctx, input }) => {
            const res = await getUserByToken(ctx.db, input);

            if (!res) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Not a valid password reset token"
                })
            }

            if (res.expires < new Date()) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Password reset token has expired"
                })
            }

            return res.user
        }),
    updateUsernamePassword: publicProcedure
        .input(resetPasswordSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                return await updateUsernamePassword(ctx.db, input);
            } catch (error) {
                if (error instanceof Error) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message
                    });
                } else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "An unknown error occurred"
                    });
                }
            }
        }),
    createPasswordResetToken: protectedProcedure
        .input(createResetPasswordTokenSchema)
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== USER_ROLES.RECRUITER) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not authorized to create password reset tokens"
                });
            }

            try {
                return await createPasswordResetToken(ctx.db, input);
            } catch (error) {
                if (error instanceof Error) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message
                    });
                } else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "An unknown error occurred"
                    });
                }
            }
        }),
            
});