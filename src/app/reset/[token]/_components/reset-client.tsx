"use client";

import HeaderView from "@/app/_components/header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";
import { isDatabaseUnavailableError } from "@/utils/databaseAvailability";
import type { ResetPasswordValues } from "@/validation/resetPassword";

import ResetPWView from "./reset-view";

type ResetPWClientsidePresenterProps = {
    token: string;
};

export default function ResetPWClientsidePresenter({ token }: ResetPWClientsidePresenterProps) {
    const router = useRouter();

    function onSignOutACB() {
        void signOut();
    }

    const userDetails = api.resetPassword.getUserDetails.useQuery(
        { token },
        {
            enabled: !!token,
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    );

    useEffect(() => {
        if (userDetails.status === "error") {
            router.replace("/");
        }
    }, [userDetails.status, router]);

    const updateUser = api.resetPassword.updateUsernamePassword.useMutation({
        onSuccess: async (_data, variables) => {
            alert("Username and password updated successfully. Logging you in...");
            await signIn("credentials", {
                username: variables.username,
                password: variables.password,
                redirect: false
            });
            router.push("/portal");
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
    })

    function submitUsernamePasswordUpdateACB(values: ResetPasswordValues) {
        updateUser.mutate(values);
    }

    return <>
        <HeaderView applicant={true} onSignOut={onSignOutACB} />
        {userDetails.status === "pending" ? (
            <main className="min-h-screen bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 mt-8">
                        <h1 className="text-4xl font-bold mb-6">Loading...</h1>
                    </div>
                </div>
            </main>
        ) : null}
        {userDetails.status === "error" ? (
            <main className="min-h-screen bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 mt-8">
                        <h1 className="text-4xl font-bold mb-6">Invalid or expired reset link. Redirecting...</h1>
                    </div>
                </div>
            </main>
        ) : null}
        {userDetails.status === "success" ? (
        <ResetPWView user={userDetails.data} token={token} onUpdate={submitUsernamePasswordUpdateACB} />
        ) : null}
    </>;
}