import { api } from "@/trpc/server";

import { redirect } from "next/navigation";

import ResetPWClientsidePresenter from "./_components/reset-client";

type ResetPWPresenterProps = {
    params: Promise<{ token: string }>;
};

export default async function ResetPWPresenter({params}: ResetPWPresenterProps) {
    const { token } = await params;

    if (!token) {
        redirect("/");
    }

    return <ResetPWClientsidePresenter token={token} />;
}