"use client";

import Link from "next/link";
import type React from "react";

type HeaderViewProps = {
    applicant: boolean;
    hideSignOut?: boolean;
    onSignOut: () => void;
};

export default function HeaderView({ applicant, onSignOut, hideSignOut }: HeaderViewProps) {
    return <header className="grid grid-cols-[1fr_5fr] absolute w-full h-10 bg-white/10 text-white">
        <Link href={"/portal"} className="flex justify-start items-center pl-2">
            <h1>{applicant ? "Career" : "Recruiting"} Portal</h1>
        </Link>
        {!hideSignOut && (
            <div className="flex items-center justify-end pr-2">
                <button onClick={onSignOut} className="hover:bg-white/20 p-1 rounded cursor-pointer">
                    Sign Out
                </button>
            </div>
        )}
    </header>
}