import type { PrismaClient } from "../../../generated/prisma";

/**
 * Returns all selectable competences for the application form.
 *
 * @param db Prisma client used for database operations.
 * @returns Competence ids and names for UI selection lists.
 */
export const getAllCompetences = (db: PrismaClient) => {
  return db.competence.findMany({
    select: {
      competence_id: true,
      name: true,
    },
  });
};
