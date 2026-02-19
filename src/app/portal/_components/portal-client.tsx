"use client";

import type { Session } from "next-auth";
import type { UserApplication } from "@/types/application";

import { signOut } from "next-auth/react";

import HeaderView from "./header";
import MainViewApplicant from "./main-applicant";
import MainViewRecruiter from "./main-recruiter";

type PortalClientsidePresenterProps = {
    session: Session | null;
    applicant: boolean;
    applications: UserApplication[] | null;
};

/**
 * Client-side presenter that renders the portal layout.
 * Switches between the applicant and recruiter main views based on the user's role.
 */
export default function PortalClientsidePresenter({ session, applicant, applications }: PortalClientsidePresenterProps) {
    function onSignOutACB() {
        signOut();
    }

    return (<>
        <HeaderView applicant={applicant} onSignOut={onSignOutACB} />
        {/* Render the appropriate main view based on user role */}
        {applicant ?
            <MainViewApplicant applications={applications} /> :
            <MainViewRecruiter applications={applications} />
        }
    </>);
}