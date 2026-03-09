import { type PrismaClient } from "../../../generated/prisma";
import {
  competenceApplicationSchema,
  type CompetenceApplicationValues,
} from "@/validation/competence";

/**
 * Replaces all competence selections for a user in one transaction.
 *
 * This follows a full-replace strategy: existing rows are removed, then the
 * validated batch is inserted. This keeps persistence logic simple and consitent.
 *
 * @param db Prisma client used for database operations.
 * @param userId Applicant id owning the competence selections.
 * @param selections New list of competence applications.
 * @returns Transaction promise completing delete + insert operations.
 * @throws When any entry in the batch fails schema validation.
 */
export const applyCompetences = async (
  db: PrismaClient,
  userId: string,
  selections: CompetenceApplicationValues[],
) => {
  for (const sel of selections) {
    const result = competenceApplicationSchema.safeParse(sel);
    if (!result.success) {
      throw new Error("Invalid competence application in batch");
    }
  }

  return db.$transaction(async (prisma) => {
    await prisma.competence_profile.deleteMany({
      where: {
        user_id: userId,
      },
    });

    if (!selections.length) {
      return;
    }

    await prisma.competence_profile.createMany({
      data: selections.map((sel) => ({
        user_id: userId,
        competence_id: sel.competence_id,
        years_of_experience: sel.years,
      })),
    });
  });
};
