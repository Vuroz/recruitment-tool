"use client";

import { useEffect, useState } from "react";
import type { UserApplication } from "@/types/application";
import { api } from "@/trpc/react";
import { formatDateISO } from "@/utils/date";

type ApplicationViewProps = {
    application: UserApplication[] | null;
};

type ApplicationState = "unhandled" | "accepted" | "rejected";

export default function ApplicationView({ application }: ApplicationViewProps) {
    const [currentStatus, setCurrentStatus] = useState<ApplicationState | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const utils = api.useUtils();
    const updateStatusMutation = api.application.updateUserApplicationState.useMutation();

    if (!application || application.length === 0) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
                <p className="text-xl text-white/60">No application data found.</p>
            </main>
        );
    }

    const user = application[0]?.user;
    const applicationState = application[0]?.user?.applicationStates?.[0];

    // Convert state_id to string format for dropdown
    const getStateString = (stateId: number | null): ApplicationState => {
        switch (stateId) {
            case 0:
                return "unhandled";
            case 1:
                return "accepted";
            case 2:
                return "rejected";
            default:
                return "unhandled";
        }
    };

    useEffect(() => {
        if (!applicationState) return;
        setCurrentStatus(getStateString(applicationState.state_id));
    }, [applicationState?.state_id]);

    const handleStatusChange = async (newState: ApplicationState) => {
        if (isUpdating || !user?.id) return;

        const previousStatus = getStateString(applicationState?.state_id ?? 0);

        setIsUpdating(true);
        setCurrentStatus(newState);

        try {
            await updateStatusMutation.mutateAsync({
                user_id: user.id,
                update_at: applicationState?.updated_at ?? null,
                new_state: newState,
            });

            // Refetch the application data
            await utils.application.getApplicationByUserId.invalidate({ user_id: user.id });
        } catch (error) {
            console.error("Failed to update status:", error);
            setCurrentStatus(previousStatus);
            const message = error instanceof Error ? error.message : "Failed to update status.";
            alert(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const experience = application.map((app) => ({
        name: app.competence?.name ?? "Unknown",
        years: app.years_of_experience ?? 0,
    }));
    const availability = (user as any)?.availability ?? [];

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white p-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 mt-8">
                    <h1 className="text-4xl font-bold mb-2">{user?.name} {user?.surname}</h1>
                    <p className="text-white/60">Application Details</p>
                </div>

                {/* Status Badge */}
                {applicationState && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Application Status
                        </label>
                        <select
                            value={currentStatus ?? "unhandled"}
                            onChange={(e) => handleStatusChange(e.target.value as ApplicationState)}
                            disabled={isUpdating}
                            className="px-4 py-2 rounded-lg bg-[#0b3f41] text-white border border-white/20 hover:bg-[#0f4c4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <option value="unhandled" className="bg-[#0b3f41] text-white">Unhandled</option>
                            <option value="accepted" className="bg-[#0b3f41] text-white">Accepted</option>
                            <option value="rejected" className="bg-[#0b3f41] text-white">Rejected</option>
                        </select>
                        {isUpdating && (
                            <p className="text-sm text-white/60 mt-2">Updating status...</p>
                        )}
                    </div>
                )}

                {/* User Information Section */}
                <div className="mb-8 rounded-xl border border-white/20 bg-white/5 p-6">
                    <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                First Name
                            </label>
                            <p className="text-lg capitalize">{user?.name ?? "-"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Last Name
                            </label>
                            <p className="text-lg capitalize">{user?.surname ?? "-"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Email
                            </label>
                            <p className="text-lg">{user?.email ?? "-"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Personal Number
                            </label>
                            <p className="text-lg">{user?.pnr ?? "-"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Last Application Change
                            </label>
                            <p className="text-lg">{formatDateISO(applicationState?.updated_at ?? null)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Applied Date
                            </label>
                            <p className="text-lg">
                                {formatDateISO(user?.createdAt ?? null)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Competencies Section */}
                <div className="rounded-xl border border-white/20 bg-white/5 p-6">
                    <h2 className="text-2xl font-semibold mb-6">Experience</h2>
                    {experience.length > 0 ? (
                        <div className="space-y-4">
                            {experience.map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-lg bg-white/10 p-4 hover:bg-white/15 transition-colors"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold capitalize">{comp.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-white/70">Years of Experience</p>
                                        <p className="text-2xl font-bold">{comp.years}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">No experience listed.</p>
                    )}
                </div>

                {/* Availability Section */}
                <div className="mt-8 rounded-xl border border-white/20 bg-white/5 p-6">
                    <h2 className="text-2xl font-semibold mb-6">Availability</h2>
                    {availability.length > 0 ? (
                        <div className="space-y-4">
                            {availability.map((period: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="rounded-lg bg-white/10 p-4 hover:bg-white/15 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-white/70 mb-1">From</p>
                                            <p className="text-lg font-semibold">
                                                {formatDateISO(period.from_date ?? null)}
                                            </p>
                                        </div>
                                        <div className="hidden md:block text-white/50">→</div>
                                        <div>
                                            <p className="text-sm text-white/70 mb-1">To</p>
                                            <p className="text-lg font-semibold">
                                                {formatDateISO(period.to_date ?? null)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">No availability information provided.</p>
                    )}
                </div>
            </div>
        </main>
    );
}