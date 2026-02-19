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

export default function PortalClientsidePresenter({ session, applicant, applications }: PortalClientsidePresenterProps) {
    function onSignOutACB() {
        signOut();
    }

    return (<>
        <HeaderView applicant={applicant} onSignOut={onSignOutACB} />
        {applicant ?
            <MainViewApplicant applications={applications} /> :
            <MainViewRecruiter applications={applications} />
        }
    </>);
}