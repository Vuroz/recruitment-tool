import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { isApplicant } from "@/server/auth/roles";

import ApplicationClientsidePresenter from "./_components/application-client";

import { api } from "@/trpc/server";

type ApplicationPresenterProps = {
    params: { id: string };
};

export default async function ApplicationPresenter({params}: ApplicationPresenterProps) {
    const session = await auth();

    const { id } = await params;

    // User is not signed in
    if (!session?.user) {
        redirect("/");
    }

    // User is an applicant trying to access recruiter page
    if (isApplicant(session.user.role)) {
        redirect("/");
    }

    const rawApplication = await api.application.getApplicationByUserId({user_id: id});

    console.log(rawApplication);
    

    const application = rawApplication?.map(app => ({
        ...app,
        years_of_experience: app.years_of_experience ? Number(app.years_of_experience) : null,
    })) ?? null;

    return <ApplicationClientsidePresenter id={id} application={application} />;
}