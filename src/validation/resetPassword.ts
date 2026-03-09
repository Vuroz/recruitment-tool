import { z } from "zod";

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetPasswordRequestSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const createResetPasswordTokenSchema = z.object({
    user_id: z.string().min(1, "User ID is required"),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordRequestValues = z.infer<typeof resetPasswordRequestSchema>;
export type CreateResetPasswordTokenValues = z.infer<typeof createResetPasswordTokenSchema>;
