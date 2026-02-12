"use client";

import type { UserApplication } from "@/types/application";
import type React from "react";

type MainViewApplicantProps = {
    applications: UserApplication[] | null
};

export default function MainViewApplicant({ applications }: MainViewApplicantProps) {
    function renderApplicationCB(item: UserApplication) {
        return <tr key={item.competence_profile_id}>
            <td className="pr-2 capitalize">{item.competence?.name}</td>
            <td>{"" + item.years_of_experience} years</td>
        </tr>
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
            <div className="flex justify-center items-center bg-white/10 p-4 rounded-xl">
                <table>
                    <thead>
                        <tr>
                            <th>Skill</th>
                            <th>Experience</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications?.map(renderApplicationCB)}
                    </tbody>
                </table>
            </div>
        </main>
    );
}