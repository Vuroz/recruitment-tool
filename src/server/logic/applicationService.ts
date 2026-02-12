import { PrismaClient } from "../../../generated/prisma";

export const getUserApplications = (db: PrismaClient, username: string) => {
    return db.competence_profile.findMany({
        where: {
            user: {
                username: username
            }
        },
        include: {
            competence: true,
            user: true
        }
    });
}