"use client";

import HeaderView from "@/app/_components/header";
import ApplicationView from "./application-view";

import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import type { UserApplication } from "@/types/application";

type ApplicationClientsidePresenterProps = {
    id: string;
    application: UserApplication[] | null;
};

export default function ApplicationClientsidePresenter(props: ApplicationClientsidePresenterProps) {
    function onSignOutACB() {
        void signOut();
    }

    const applicationQuery = api.application.getApplicationByUserId.useQuery(
        { user_id: props.id },
        {
            refetchOnWindowFocus: false,
        }
    );

    const normalizeApplications = (
        apps: typeof applicationQuery.data | null | undefined
    ): UserApplication[] | null => {
        if (!apps) return null;
        return apps.map((app) => ({
            ...app,
            years_of_experience: app.years_of_experience ? Number(app.years_of_experience) : null,
        }));
    };

    const application = normalizeApplications(applicationQuery.data) ?? props.application;
    
    return <>
        <HeaderView applicant={false} onSignOut={onSignOutACB} />
        <ApplicationView application={application} />
    </>
}