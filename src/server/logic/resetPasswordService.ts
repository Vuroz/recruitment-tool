import type { ResetPasswordRequestValues, ResetPasswordValues, CreateResetPasswordTokenValues } from "@/validation/resetPassword";
import { resetPasswordSchema, createResetPasswordTokenSchema } from "@/validation/resetPassword";
import { PrismaClient } from "../../../generated/prisma";
import bcrypt from "bcrypt"
import { randomUUID } from "crypto";
import { resend } from "@/utils/resend";

/**
 * Resolves a reset token and loads lightweight user details for the reset page.
 *
 * @param db Prisma client used for database operations.
 * @param input Token payload from request validation.
 * @returns Token record with name/surname, or `null` when token is unknown.
 */
export const getUserByToken = (db: PrismaClient, input: ResetPasswordRequestValues) => {
  return db.password_reset_token.findUnique({
    where: {
        token: input.token
    },
    include: {
        user: {
            select: {
                name: true,
                surname: true,
            }
        }
    }
  });
};

/**
 * Sends a password reset email containing the generated reset link.
 *
 * @param token Unique password reset token.
 * @param recipientName Display name used in the recipient header.
 * @param recipient Email address for delivery.
 * @throws When the mail provider returns an error.
 */
export const sendResetEmail = async (token: string, recipientName: string, recipient?: string, ) => {
    if (!recipient) {
        console.error("User has no email address");
        return;
    }

    if (recipient?.endsWith("@finnsinte.se")) {
        console.warn("User's email domain is finnsinte.se, skipping sending reset link");
        return;
    }

    const { data, error } = await resend.emails.send({
        from: 'Friend <reset@noreply.vuroz.dev>',
        to: `${recipientName} <${recipient}>`,
        subject: 'Password Reset Request',
        html: `<p>You need to reset your username and password.</p>
               <a href="https://iv1201.vuroz.dev/reset/${token}">Reset Password</a>
               <p>If you did not apply to [company name], please ignore this email</p>`,
    });

    if (error) {
        console.error(error);
        throw new Error("Failed to send reset email");
    }
}

/**
 * Creates a new password reset token for one applicant.
 *
 * Existing tokens for the same user are removed first so only one active token
 * remains. Token generation is wrapped in a transaction to keep this flow atomic.
 *
 * @param db Prisma client used for database operations.
 * @param input Payload containing the target user id.
 * @returns Newly created reset token.
 * @throws When input validation fails or user cannot be found.
 */
export const createPasswordResetToken = async (db: PrismaClient, input: CreateResetPasswordTokenValues) => {
    const validationResult = createResetPasswordTokenSchema.safeParse(input);
    if (!validationResult.success) {
        throw new Error("Internal server error");
    }
    const validatedValues = validationResult.data;

    const user = await db.user.findUnique({
        where: {
            id: validatedValues.user_id,
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const existingTokens = await db.password_reset_token.findMany({
        where: {
            user_id: validatedValues.user_id,
        }
    });

    let token = randomUUID();
    await db.$transaction(async (prisma) => {
        for (const existingToken of existingTokens) {
            await prisma.password_reset_token.delete({
                where: {
                    token: existingToken.token,
                }
            });
        }

        let done = false;
        while (!done) {
            const exists = await prisma.password_reset_token.findUnique({
                where: {
                    token: token,
                }
            })
            // The chance of this happening is roughly 1 / 2^122, but gotta handle it
            if (!exists) {
                done = true;
            }
        }
        
        await prisma.password_reset_token.create({
            data: {
                token,
                user_id: validatedValues.user_id,
                expires: new Date(Date.now() + 604800000), // 7 days from now (7 * 24 * 60 * 60 * 1000 = 604800000)
            }
        });
    });

    await sendResetEmail(token, user.name ?? "", user.email ?? "");

    return token
}

/**
 * Updates credentials for the user referenced by a reset token.
 *
 * @param db Prisma client used for database operations.
 * @param input Reset payload containing token, new username, and new password.
 * @throws If token is invalid/expired, username is already taken, or validation fails.
 * @returns Transaction promise that updates user and consumes the token.
 */
export const updateUsernamePassword = async (db: PrismaClient, input: ResetPasswordValues) => {
    const validationResult = resetPasswordSchema.safeParse(input);
    if (!validationResult.success) {
        throw new Error("Internal server error");
    }
    const validatedValues = validationResult.data;

    const token_entry = await db.password_reset_token.findUnique({
        where: {
            token: validatedValues.token,
            expires: {
                gt: new Date()
            }
        },
        include: {
            user: true,
        }
    });

    if (!token_entry) {
        throw new Error("Invalid or expired token");
    }

    const existing_user = await db.user.findUnique({
        where: {
            username: validatedValues.username,
        }
    });

    if (existing_user && existing_user.id !== token_entry.user_id) {
        throw new Error("Username already taken");
    }

    const hashedPassword = bcrypt.hashSync(validatedValues.password, 10);

    return db.$transaction(async (prisma) => {
        await prisma.user.update({
            where: {
                id: token_entry.user_id,
            },
            data: {
                username: validatedValues.username,
                password: hashedPassword,
            }
        });
        await prisma.password_reset_token.delete({
            where: {
                token: validatedValues.token,
            }
        });
    });
};
