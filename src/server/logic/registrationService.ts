import { type PrismaClient } from "../../../generated/prisma";

import {
    registrationSchema,
    type RegistrationValues,
} from "@/validation/registration";

export const createUser = (
    db: PrismaClient,
    values: RegistrationValues
) => {
    const validationResult = registrationSchema.safeParse(values);
    if (!validationResult.success) {
        throw new Error("Internal server error");
    }
    const validatedValues = validationResult.data;
    
    return db.user.create({
        data: {
            name: validatedValues.fname,
            surname: validatedValues.lname,
            email: validatedValues.email,
            pnr: validatedValues.pnr,
            username: validatedValues.username,
            password: validatedValues.password,
            role_id: 2,
        }
    })
}