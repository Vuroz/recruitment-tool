"use client";

import type { UserApplication } from "@/types/application";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

type MainViewRecruiterProps = {
    applications: UserApplication[] | null;
};

/** Represents a single applicant with all their competencies grouped together. */
type GroupedApplicant = {
    userId: string;
    name: string;
    surname: string;
    state: number | null;
    submittedAt: Date | null;
    skills: Record<string, number | null>;
};

const columnHelper = createColumnHelper<GroupedApplicant>();
const COLUMN_IDS = {
    submittedAt: "submittedAt",
    nameGroup: "nameGroup",
    firstName: "firstName",
    lastName: "lastName",
    skillsGroup: "skillsGroup",
    status: "status",
} as const;

const skillColumnId = (skillName: string) => `skill-${skillName}`;

/**
 * Groups a flat list of competence profiles by user.
 * Each user appears once with all their skills collected into an object keyed by skill name.
 */
function groupByUser(applications: UserApplication[]): GroupedApplicant[] {
    const map = new Map<string, GroupedApplicant>();

    for (const app of applications) {
        const userId = app.user_id ?? "unknown";
        if (!map.has(userId)) {
            map.set(userId, {
                userId,
                name: app.user?.name ?? "",
                surname: app.user?.surname ?? "",
                skills: {},
                state: app.user?.applicationStates[0]?.state_id ?? null,
                submittedAt: app.user?.applicationStates[0]?.created_at ?? null,
            });
        }

        const skillName = app.competence?.name ?? "Unknown";
        map.get(userId)!.skills[skillName] = app.years_of_experience ?? null;
    }

    return Array.from(map.values());
}

function applicationStateToText(state: number | null): string {
    switch (state) {
        case 0:
            return "Unhandled";
        case 1:
            return "Accepted";
        case 2:
            return "Rejected";
        default:
            return "Error";
    }
}

function getStateColor(state: number | null): string {
    switch (state) {
        case 0:
            return "bg-gray-500";
        case 1:
            return "bg-green-500";
        case 2:
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
}

/** Recruiter portal view — displays all applicants as individual cards, grouped by user. */
export default function MainViewRecruiter({ applications }: MainViewRecruiterProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const grouped = useMemo(() => (applications ? groupByUser(applications) : []), [applications]);
    const skillNames = useMemo(
        () => Array.from(new Set(grouped.flatMap((applicant) => Object.keys(applicant.skills)))).sort(),
        [grouped],
    );

    const firstSkillId = skillNames.length > 0 ? skillColumnId(skillNames[0]!) : undefined;
    const lastSkillId =
        skillNames.length > 0 ? skillColumnId(skillNames[skillNames.length - 1]!) : undefined;

    const columns = useMemo(() => {
        const skillColumns = skillNames.map((skill) =>
            columnHelper.accessor((row) => row.skills[skill] ?? undefined, {
                id: skillColumnId(skill),
                header: skill,
                sortingFn: "basic",
                sortUndefined: "last",
                cell: (info) => (info.getValue() != null ? `${info.getValue()} years` : "-"),
            }),
        );

        return [
            columnHelper.accessor("submittedAt", {
                id: COLUMN_IDS.submittedAt,
                header: "Submitted",
                sortingFn: "datetime",
                sortUndefined: "last",
                sortDescFirst: true,
                cell: (info) => {
                    const value = info.getValue();
                    return value ? new Date(value).toLocaleDateString() : "-";
                },
            }),
            columnHelper.group({
                id: COLUMN_IDS.nameGroup,
                header: "Name",
                columns: [
                    columnHelper.accessor("name", {
                        id: COLUMN_IDS.firstName,
                        header: "First Name",
                        cell: (info) => info.getValue(),
                    }),
                    columnHelper.accessor("surname", {
                        id: COLUMN_IDS.lastName,
                        header: "Last Name",
                        cell: (info) => info.getValue(),
                    }),
                ],
            }),
            columnHelper.group({
                id: COLUMN_IDS.skillsGroup,
                header: "Skills (years)",
                columns: skillColumns,
            }),
            columnHelper.accessor("state", {
                id: COLUMN_IDS.status,
                header: "Status",
                sortDescFirst: true,
                cell: (info) => {
                    const state = info.getValue();
                    return (
                        <span className={`px-3 py-1 rounded text-sm font-medium ${getStateColor(state)}`}>
                            {applicationStateToText(state)}
                        </span>
                    );
                },
            }),
        ];
    }, [skillNames]);

    const table = useReactTable({
        data: grouped,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
    });

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
            <h2 className="text-xl font-semibold mb-6 mt-20">All Applications</h2>
            {grouped.length > 0 ? (
            <div className="w-full max-w-6xl overflow-x-auto rounded-xl border border-white/20 bg-white/5">
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-white/20">
                                {headerGroup.headers.map((header) => {
                                    const columnId = header.column.id;
                                    const isTopGroup = header.depth === 0;
                                    const isGroupLabel =
                                        columnId === COLUMN_IDS.nameGroup || columnId === COLUMN_IDS.skillsGroup;
                                    const isLeftBoundary =
                                        columnId === COLUMN_IDS.firstName ||
                                        (firstSkillId !== undefined && columnId === firstSkillId);
                                    const isRightBoundary =
                                        columnId === COLUMN_IDS.lastName ||
                                        (lastSkillId !== undefined && columnId === lastSkillId);

                                    const headerClassName = [
                                        "px-2 py-3 font-semibold text-left",
                                        isTopGroup ? "bg-white/5" : "",
                                        isGroupLabel ? "text-center border-x-2 border-white/30" : "",
                                        isLeftBoundary ? "border-l-2 border-white/20" : "",
                                        isRightBoundary ? "border-r-2 border-white/20" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    const canSort = header.column.getCanSort();
                                    const sortState = header.column.getIsSorted();
                                    const sortIndicator =
                                        sortState === "asc" ? " ↑" : sortState === "desc" ? " ↓" : "";

                                    return (
                                        <th key={header.id} colSpan={header.colSpan} className={headerClassName}>
                                            {header.isPlaceholder
                                                ? null
                                                : canSort
                                                  ? (
                                                        <button
                                                            type="button"
                                                            className="cursor-pointer select-none capitalize"
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            title={
                                                                header.column.getNextSortingOrder() === "asc"
                                                                    ? "Sort ascending"
                                                                    : header.column.getNextSortingOrder() === "desc"
                                                                      ? "Sort descending"
                                                                      : "Clear sort"
                                                            }
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext(),
                                                            )}
                                                            {sortIndicator}
                                                        </button>
                                                    )
                                                  : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="bg-white/10 hover:bg-white/20 transition-colors border-b border-white/10"
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const columnId = cell.column.id;
                                    const isLeftBoundary =
                                        columnId === COLUMN_IDS.firstName ||
                                        (firstSkillId !== undefined && columnId === firstSkillId);
                                    const isRightBoundary =
                                        columnId === COLUMN_IDS.lastName ||
                                        (lastSkillId !== undefined && columnId === lastSkillId);

                                    const bodyClassName = [
                                        "px-2 py-3 text-sm text-white/80",
                                        isLeftBoundary ? "border-l-2 border-white/15" : "",
                                        isRightBoundary ? "border-r-2 border-white/15" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    return (
                                        <td key={cell.id} className={bodyClassName}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) : (
            <p className="text-white/60">No applications found.</p>
            )}
        </main>
    );
}