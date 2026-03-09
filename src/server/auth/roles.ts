/**
 * Defines the possible roles for a user in the system.
 */
export const USER_ROLES = {
  RECRUITER: "recruiter",
  APPLICANT: "applicant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Checks whether a role corresponds to the recruiter privilege set.
 *
 * @param role Role value from session or database.
 * @returns `true` for recruiter role.
 */
export const isRecruiter = (role?: UserRole | null) => {
  return role === USER_ROLES.RECRUITER;
};

/**
 * Checks whether a role corresponds to the applicant privilege set.
 *
 * @param role Role value from session or database.
 * @returns `true` for applicant role.
 */
export const isApplicant = (role?: UserRole | null) => {
  return role === USER_ROLES.APPLICANT;
};
