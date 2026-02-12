export const USER_ROLES = {
  RECRUITER: "recruiter",
  APPLICANT: "applicant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const isRecruiter = (role?: UserRole | null) => {
    return role === USER_ROLES.RECRUITER;
};

export const isApplicant = (role?: UserRole | null) => {
    return role === USER_ROLES.APPLICANT;
};
