"use client";

import React from "react";
import type { UserApplication } from "@/types/application";
import type { availability } from "generated/prisma";
import { formatDateISO } from "@/utils/date";
import type { AvailabilityValues } from "@/validation/availability";

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
  availabilities: availability[] | null;
  selections: CompetenceSelection[];
  onToggleSelection: (id: number) => void;
  onUpdateYears: (id: number, years: number) => void;
  onSubmit: () => void;
  onAddAvailability: (values: AvailabilityValues) => void;
  onRemoveAvailability: (id: number) => void;
};

export default function MainViewApplicant({
  applications,
  competences,
  availabilities,
  selections,
  onToggleSelection,
  onUpdateYears,
  onSubmit,
  onAddAvailability,
  onRemoveAvailability,
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
        <label className="flex-1 cursor-pointer">
          <input
            type="checkbox"
            checked={selection.selected}
            onChange={() => onToggleSelection(selection.competence_id)}
            className="mr-2 cursor-pointer"
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

  function renderAvailabilityCB(item: availability) {
    function onRemoveACB() {
      onRemoveAvailability(item.availability_id);
    }

    return (
      <tr key={item.availability_id}>
        <td className="pr-2">{formatDateISO(item.from_date)}</td>
        <td className="pr-2">{formatDateISO(item.to_date)}</td>
        <td>
          <button
            type="button"
            className="bg-white/20 pl-2 pr-2 rounded mb-2 hover:bg-white/30 cursor-pointer"
            onClick={onRemoveACB}
          >
              x
          </button>
        </td>
      </tr>
    );
  }

  function onAddAvailabilityACB(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fromDateValue = formData.get("from-date");
    const toDateValue = formData.get("to-date");
    const values: AvailabilityValues = {
      from_date: new Date((typeof fromDateValue === "string" ? fromDateValue : "").trim()),
      to_date: new Date((typeof toDateValue === "string" ? toDateValue : "").trim()),
    };

    onAddAvailability(values);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] p-4 text-white">
      <div className="flex flex-row gap-8">
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl bg-white/10 p-4">
          <h2 className="text-xl font-bold">Competences</h2>
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
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl bg-white/10 p-4">
          <h2 className="text-xl font-bold">Availabilities</h2>
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {availabilities?.sort((a, b) => {
                const dateA = a.from_date?.getTime() ?? 0;
                const dateB = b.from_date?.getTime() ?? 0;
                return dateA - dateB;
              }).map(renderAvailabilityCB)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-row gap-8">
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
            className="mt-4 rounded bg-white/20 py-2 font-bold hover:bg-white/30 cursor-pointer"
          >
            Submit Competences
          </button>
        </form>
        <form
          className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white/10 p-4"
          onSubmit={onAddAvailabilityACB}
        >
          <h2 className="mb-2 text-2xl font-bold">Select Availability</h2>

          <div className="flex flex-row gap-4 items-center">
            <label htmlFor="from-date" className="flex-1">From:</label>
            <input type="date" name="from-date" id="from-date" className="bg-white/20 p-2 rounded" />
          </div>

          <div className="flex flex-row gap-4 items-center">
            <label htmlFor="to-date" className="flex-1">To:</label>
            <input type="date" name="to-date" id="to-date" className="bg-white/20 p-2 rounded" />
          </div>

          <div className="flex-1 h-full flex items-end">
            <button
              className="rounded bg-white/20 py-2 font-bold hover:bg-white/30 flex-1 cursor-pointer"
            >
              Add Availability
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
