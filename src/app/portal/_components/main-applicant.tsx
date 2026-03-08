"use client";

import React from "react";
import type { UserApplication } from "@/types/application";

type Competence = {
  competence_id: number;
  name: string | null;
};

type CompetenceSelection = {
  competence_id: number;
  years: number;
  selected: boolean;
};

type MainViewApplicantProps = {
  applications: UserApplication[] | null;
  competences: Competence[] | null;
  selections: CompetenceSelection[];
  onToggleSelection: (id: number) => void;
  onUpdateYears: (id: number, years: number) => void;
  onSubmit: () => void;
};

export default function MainViewApplicant({
  applications,
  competences,
  selections,
  onToggleSelection,
  onUpdateYears,
  onSubmit,
}: MainViewApplicantProps) {
  // Applications table row renderer
  function renderApplicationCB(item: UserApplication) {
    return (
      <tr key={item.competence_profile_id}>
        <td className="pr-2 capitalize">{item.competence?.name}</td>
        <td>{item.years_of_experience} years</td>
      </tr>
    );
  }
  // Competence selection renderer
  function renderSelectionCB(selection: CompetenceSelection) {
    const competence = competences?.find(
      (c) => c.competence_id === selection.competence_id,
    );

    return (
      <div
        key={selection.competence_id}
        className="flex items-center justify-between gap-2 rounded bg-white/20 p-2"
      >
        <label className="flex-1">
          <input
            type="checkbox"
            checked={selection.selected}
            onChange={() => onToggleSelection(selection.competence_id)}
            className="mr-2"
          />
          {competence?.name ?? "Unnamed competence"}
        </label>

        {selection.selected && (
          <input
            type="number"
            min={0}
            step={0.1}
            value={selection.years ?? 0}
            onChange={(e) =>
              onUpdateYears(
                selection.competence_id,
                parseFloat(e.target.value) || 0,
              )
            }
            className="w-16 rounded px-1 text-black"
            placeholder="Years"
          />
        )}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] p-4 text-white">
      <div className="mb-8 flex items-center justify-center rounded-xl bg-white/10 p-4">
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Experience</th>
            </tr>
          </thead>
          <tbody>{applications?.map(renderApplicationCB)}</tbody>
        </table>
      </div>

      <form
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white/10 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h2 className="mb-2 text-2xl font-bold">Select Competences</h2>

        {selections.map(renderSelectionCB)}

        <button
          type="submit"
          className="mt-4 rounded bg-white/20 py-2 font-bold hover:bg-white/30"
        >
          Submit Competences
        </button>
      </form>
    </main>
  );
}
