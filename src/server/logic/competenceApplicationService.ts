import { type PrismaClient } from "../../../generated/prisma";
import {
  competenceApplicationSchema,
  type CompetenceApplicationValues,
} from "@/validation/competence";

export const applyCompetence = async (
  db: PrismaClient,
  userId: string,
  values: CompetenceApplicationValues,
) => {
  const result = competenceApplicationSchema.safeParse(values);
  if (!result.success) {
    throw new Error("Invalid competence application");
  }
  const validated = result.data;

  const existing = await db.competence_profile.findFirst({
    where: {
      user_id: userId,
      competence_id: validated.competence_id,
    },
  });

  if (existing) {
    return db.competence_profile.update({
      where: { competence_profile_id: existing.competence_profile_id },
      data: { years_of_experience: validated.years },
    });
  } else {
    return db.competence_profile.create({
      data: {
        user_id: userId,
        competence_id: validated.competence_id,
        years_of_experience: validated.years,
      },
    });
  }
};

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
  const submittedIds = selections.map((s) => s.competence_id);

  await db.competence_profile.deleteMany({
    where: {
      user_id: userId,
      competence_id: {
        notIn: submittedIds.length ? submittedIds : [-1],
      },
    },
  });

  const results = [];

  for (const sel of selections) {
    const res = await applyCompetence(db, userId, sel);
    results.push(res);
  }

  return results;
};
