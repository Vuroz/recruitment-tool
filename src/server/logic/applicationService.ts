import { PrismaClient } from "../../../generated/prisma";

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
                },
            },
        }
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
                    applicationStates: true
                }
            }
        }
    });
}