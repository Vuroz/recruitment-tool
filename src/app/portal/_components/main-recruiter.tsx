"use client";

import type { UserApplication } from "@/types/application";
import type React from "react";

type MainViewRecruiterProps = {
    applications: UserApplication[] | null;
};

type GroupedApplicant = {
    userId: string;
    name: string;
    surname: string;
    skills: { name: string; years: number | null }[];
};

function groupByUser(applications: UserApplication[]): GroupedApplicant[] {
    const map = new Map<string, GroupedApplicant>();

    for (const app of applications) {
        const userId = app.user_id ?? "unknown";
        if (!map.has(userId)) {
            map.set(userId, {
                userId,
                name: app.user?.name ?? "",
                surname: app.user?.surname ?? "",
                skills: [],
            });
        }
        map.get(userId)!.skills.push({
            name: app.competence?.name ?? "Unknown",
            years: app.years_of_experience,
        });
    }

    return Array.from(map.values());
}

export default function MainViewRecruiter({ applications }: MainViewRecruiterProps) {
    const grouped = applications ? groupByUser(applications) : [];

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
            <h2 className="text-xl font-semibold mb-6">All Applications</h2>
            {grouped.length > 0 ? (
                <div className="flex flex-col gap-4 w-full max-w-lg">
                    {grouped.map((applicant) => (
                        <div
                            key={applicant.userId}
                            className="bg-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            <h3 className="font-semibold capitalize mb-2">
                                {applicant.name} {applicant.surname}
                            </h3>
                            <ul className="list-none space-y-1 text-sm text-white/80">
                                {applicant.skills.map((skill, i) => (
                                    <li key={i} className="capitalize">
                                        {skill.name} — {String(skill.years)} years
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-white/60">No applications found.</p>
            )}
        </main>
    );
}