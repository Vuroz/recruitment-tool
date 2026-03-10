import type { PrismaClient } from "../../../generated/prisma";
import { logMainError, logMainEvent } from "@/server/logger";

/**
 * Fetches all competence profiles for a specific user.
 * Used by the applicant portal view to show their own skills and experience.
 *
 * @param db Prisma client used for database operations.
 * @param username Authenticated applicant username.
 * @returns Competence profiles enriched with related user and availability data.
 */
export const getUserApplications = (db: PrismaClient, username: string) => {
    return db.competence_profile.findMany({
        where: {
            user: {
                username: username
            }
        },
        include: {
            competence: true,
            user: {
                include: {
                    applicationStates: true,
                    availability: true,
                },
            },
        }
    });
}


export const getApplicationByUserId = (db: PrismaClient, userId: string) => {
    return db.competence_profile.findMany({
        where: {
            user_id: userId
        },
        include: {
            competence: true,
            user: {
                include: {
                    applicationStates: true,
                    availability: true,
                },
            },
        }
    });
}

/**
 * Fetches the application state for a specific user.
 * Used to check for optimistic concurrency control conflicts.
 *
 * @param db Prisma client used for database operations.
 * @param userId User id whose current state snapshot should be returned.
 * @returns The latest application state row, or `null` if no state exists.
 */
export const getApplicationStateByUserId = (db: PrismaClient, userId: string) => {
    return db.application_state.findFirst({
        where: {
            user_id: userId
        }
    })
}

/**
 * Updates the application state for a specific user.
 * Used by recruiters to change the status of an application.
 *
 * @param db Prisma client used for database operations.
 * @param userId User id whose state will be updated.
 * @param newState New recruiter decision state.
 * @returns Transaction promise that completes after state mutation.
 */
export const updateApplicationState = (db: PrismaClient, userId: string, newState: "unhandled" | "accepted" | "rejected") => {
    const stateMap: Record<string, number> = {
        "unhandled": 0,
        "accepted": 1,
        "rejected": 2
    };

    return db.$transaction(async (prisma) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        const result = await prisma.application_state.updateMany({
            where: {
                user_id: userId
            },
            data: {
                state_id: stateMap[newState],
                updated_at: new Date()
            }
        });

        if (result.count === 0) {
            logMainError("Application state update failed", { userId, reason: "state_not_found" });
            return;
        }

        logMainEvent("Application state updated", {
            userId,
            username: user?.username ?? "unknown",
            state: newState,
        });
    });
}
/**
 * Fetches all competence profiles across all users.
 * Used by the recruiter portal view to list every applicant's skills.
 *
 * @param db Prisma client used for database operations.
 * @returns Full applicant competence dataset for recruiter overviews.
 */
export const getAllApplications = (db: PrismaClient) => {
    return db.competence_profile.findMany({
        include: {
            competence: true,
            user: {
                include: {
                    applicationStates: true,
                    availability: true,
                }
            }
        }
    });
}