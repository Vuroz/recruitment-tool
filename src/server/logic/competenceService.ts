import { PrismaClient } from "../../../generated/prisma";

export const getAllCompetences = (db: PrismaClient) => {
  return db.competence.findMany({
    select: {
      competence_id: true,
      name: true,
    },
  });
};
