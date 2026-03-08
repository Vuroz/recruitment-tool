import { type PrismaClient } from "../../../generated/prisma";

import {
    registrationSchema,
    type RegistrationValues,
} from "@/validation/registration";

/**
 * Creates a new user with an initial application state.
 * 
 * @param db - The Prisma database client
 * @param values - The registration data containing user information
 * @returns A promise that resolves when the user and application state are created
 * @throws When user data validation fails
 */
export const createUser = (
    db: PrismaClient,
    values: RegistrationValues
) => {
    const validationResult = registrationSchema.safeParse(values);
    if (!validationResult.success) {
        throw new Error("Internal server error");
    }
    const validatedValues = validationResult.data;
    
    return db.$transaction(async (prisma) => {
        await prisma.user.create({
            data: {
                name: validatedValues.fname,
                surname: validatedValues.lname,
                email: validatedValues.email,
                pnr: validatedValues.pnr,
                username: validatedValues.username,
                password: validatedValues.password,
                role_id: 2,
                
                applicationStates: {
                    create: {
                        state_id: 0,
                    }
                }
            }
        });
    });
}