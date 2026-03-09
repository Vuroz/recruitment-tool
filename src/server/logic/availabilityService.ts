import type { PrismaClient } from "../../../generated/prisma";
import {
    availabilitySchema,
    availabilityIdSchema,
    type AvailabilityValues,
    type AvailabilityIdValue,
} from "@/validation/availability";

export const getAvailabilityByUserId = (db: PrismaClient, userId: string) => {
  return db.availability.findMany({
    where: {
      user_id: userId,
    },
  });
};

export const addAvailabilityByUserId = (db: PrismaClient, userId: string, values: AvailabilityValues) => {
    const validationResult = availabilitySchema.safeParse(values);
        if (!validationResult.success) {
            throw new Error("Internal server error");
        }
    const validatedValues = validationResult.data;

    return db.$transaction(async (prisma) => {
        await prisma.availability.create({
            data: {
                user_id: userId,
                from_date: validatedValues.from_date,
                to_date: validatedValues.to_date,
            },
        });
    });
};

export const removeAvailabilityById = (db: PrismaClient, userId: string, value: AvailabilityIdValue) => {
    const validationResult = availabilityIdSchema.safeParse(value);
    if (!validationResult.success) {
        throw new Error("Internal server error");
    }
    const validatedValue = validationResult.data;

    return db.$transaction(async (prisma) => {
        // deleteMany is used here because then it will only delete if such a record exists,
        // and instead of us manually fetching any record which matches, this will only delete
        // if the logged in user's id matches the one in the record.

        // in other words, this works both as a performance optimization and a security measure
        await prisma.availability.deleteMany({
            where: {
                availability_id: validatedValue.id,
                user_id: userId,
            }
        })
    });
}