import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

import PortalClientsidePresenter from "./_components/portal-client";
import { api } from "@/trpc/server";
import { isApplicant } from "@/server/auth/roles";

export default async function PortalPresenter() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const applicant = isApplicant(session?.user.role);

    const rawApplications = applicant ? await api.application.userApplications() : null;
    
    const applications = rawApplications?.map(app => ({
        ...app,
        years_of_experience: app.years_of_experience ? Number(app.years_of_experience) : null,
    })) ?? null;
    
    return <PortalClientsidePresenter session={session} applicant={applicant} applications={applications} />;
}