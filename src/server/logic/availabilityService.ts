import type { PrismaClient } from "../../../generated/prisma";
import {
    availabilitySchema,
    availabilityIdSchema,
    type AvailabilityValues,
    type AvailabilityIdValue,
} from "@/validation/availability";
import { logMainError, logMainEvent } from "@/server/logger";

/**
 * Returns all availability windows for a single user.
 *
 * @param db Prisma client used for database operations.
 * @param userId Owner of the availability records.
 * @returns Availability rows associated with the provided user.
 */
export const getAvailabilityByUserId = (db: PrismaClient, userId: string) => {
  return db.availability.findMany({
    where: {
      user_id: userId,
    },
  });
};

/**
 * Validates and persists one availability window for a user.
 *
 * @param db Prisma client used for database operations.
 * @param userId Owner of the availability entry.
 * @param values Availability payload from API input.
 * @returns Transaction promise for the insert operation.
 * @throws When schema validation fails.
 */
export const addAvailabilityByUserId = (db: PrismaClient, userId: string, values: AvailabilityValues) => {
    const validationResult = availabilitySchema.safeParse(values);
        if (!validationResult.success) {
            logMainError("Add availability failed", { userId, reason: "validation_error" });
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

        logMainEvent("Availability added", {
            userId,
            fromDate: validatedValues.from_date.toISOString(),
            toDate: validatedValues.to_date.toISOString(),
        });
    });
};

/**
 * Removes a specific availability row owned by the current user.
 *
 * Using `deleteMany` avoids leaking whether an id exists for another user,
 * so this doubles as a tiny securty and performance improvement.
 *
 * @param db Prisma client used for database operations.
 * @param userId Authenticated user id.
 * @param value Input object containing availability id.
 * @returns Transaction promise for the delete operation.
 * @throws When schema validation fails.
 */
export const removeAvailabilityById = (db: PrismaClient, userId: string, value: AvailabilityIdValue) => {
    const validationResult = availabilityIdSchema.safeParse(value);
    if (!validationResult.success) {
        logMainError("Remove availability failed", { userId, reason: "validation_error" });
        throw new Error("Internal server error");
    }
    const validatedValue = validationResult.data;

    return db.$transaction(async (prisma) => {
        // deleteMany is used here because then it will only delete if such a record exists,
        // and instead of us manually fetching any record which matches, this will only delete
        // if the logged in user's id matches the one in the record.

        // in other words, this works both as a performance optimization and a security measure
        const result = await prisma.availability.deleteMany({
            where: {
                availability_id: validatedValue.id,
                user_id: userId,
            }
        })

        if (result.count === 0) {
            logMainError("Remove availability failed", {
                userId,
                availabilityId: validatedValue.id,
                reason: "not_found_or_not_owned",
            });
            return;
        }

        logMainEvent("Availability removed", {
            userId,
            availabilityId: validatedValue.id,
        });
    });
}