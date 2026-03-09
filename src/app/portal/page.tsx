import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

import PortalClientsidePresenter from "./_components/portal-client";
import { api } from "@/trpc/server";
import { isApplicant } from "@/server/auth/roles";

/**
 * Server-side presenter for the portal page.
 * Determines the user's role and fetches the appropriate application data:
 * - Applicants see only their own competence profiles.
 * - Recruiters see all competence profiles across all users.
 */
export default async function PortalPresenter() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const applicant = isApplicant(session?.user.role);
  
  const competences = applicant ? await api.competence.getAll() : null;
  const availabilities = applicant ? await api.availability.getUserAvailability() : null;

  const rawApplications = applicant
    ? await api.application.userApplications()
    : await api.application.allApplications();

  const applications =
    rawApplications?.map((app) => ({
      ...app,
      years_of_experience: app.years_of_experience
        ? Number(app.years_of_experience)
        : null,
    })) ?? null;

  return (
    <PortalClientsidePresenter
      session={session}
      applicant={applicant}
      applications={applications}
      competences={competences}
      availabilities={availabilities}
    />
  );
}
