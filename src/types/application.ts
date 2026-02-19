import type { Prisma } from "../../generated/prisma";

export type UserApplication = Omit<
  Prisma.competence_profileGetPayload<{
    include: {
      competence: true;
      user: {
        include: {
          applicationStates: true;
          availability: true;
        }
      };
    };
  }>,
  "years_of_experience"
> & {
  years_of_experience: number | null;
};
