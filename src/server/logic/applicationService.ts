import type { PrismaClient } from "../../../generated/prisma";

/**
 * Fetches all competence profiles for a specific user.
 * Used by the applicant portal view to show their own skills and experience.
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
 */
export const updateApplicationState = (db: PrismaClient, userId: string, newState: "unhandled" | "accepted" | "rejected") => {
    const stateMap: Record<string, number> = {
        "unhandled": 0,
        "accepted": 1,
        "rejected": 2
    };

    return db.$transaction(async (prisma) => {
        await prisma.application_state.updateMany({
            where: {
                user_id: userId
            },
            data: {
                state_id: stateMap[newState],
                updated_at: new Date()
            }
        });
    });
}
/**
 * Fetches all competence profiles across all users.
 * Used by the recruiter portal view to list every applicant's skills.
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