"use client";

import HeaderView from "@/app/_components/header";
import ApplicationView from "./application-view";

import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import type { UserApplication } from "@/types/application";
import { isDatabaseUnavailableError } from "@/utils/databaseAvailability";

type ApplicationClientsidePresenterProps = {
    id: string;
    application: UserApplication[] | null;
};

export default function ApplicationClientsidePresenter(props: ApplicationClientsidePresenterProps) {
    function onSignOutACB() {
        signOut();
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
    
    const resetLinkMutation = api.resetPassword.createPasswordResetToken.useMutation({
        onSuccess: (data, _variables) => {
            alert(`Password reset link sent successfully (available at /reset/${data}).`);
        },
        onError: (error) => {
            if (isDatabaseUnavailableError(error)) {
                return;
            }
            const validationErrors = error.data?.zodError?.fieldErrors;
            if (validationErrors && Object.keys(validationErrors).length > 0) {
                const errorMsg = Object.values(validationErrors)[0];
                alert(errorMsg);
                return;
            }
            const formErrors = error.data?.zodError?.formErrors;
            if (formErrors && Object.keys(formErrors).length > 0) {
                const errorMsg = Object.values(formErrors)[0];
                alert(errorMsg);
                return;
            }
            alert(error.message || "Internal server error");
        }
    });

    function onPushResetLinkACB() {
        if (!application || application.length === 0) {
            alert("Please wait for application data to load.");
            return;
        }
        resetLinkMutation.mutate({ user_id: props.id });
    }

    return <>
        <HeaderView applicant={false} onSignOut={onSignOutACB} />
        <ApplicationView application={application} onPushResetLink={onPushResetLinkACB} />
    </>
}