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
            <div className="flex flex-col items-center bg-white/10 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">All Applications</h2>
                {grouped.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th className="pr-4 text-left">Applicant</th>
                                <th className="text-left">Competencies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grouped.map((applicant) => (
                                <tr key={applicant.userId} className="align-top">
                                    <td className="pr-4 py-2 capitalize">
                                        {applicant.name} {applicant.surname}
                                    </td>
                                    <td className="py-2">
                                        <ul className="list-none space-y-1">
                                            {applicant.skills.map((skill, i) => (
                                                <li key={i} className="capitalize">
                                                    {skill.name} — {String(skill.years)} years
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-white/60">No applications found.</p>
                )}
            </div>
        </main>
    );
}