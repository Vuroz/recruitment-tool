"use client";

import type { Session } from "next-auth";
import type { UserApplication } from "@/types/application";

import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import HeaderView from "./header";
import MainViewApplicant from "./main-applicant";
import MainViewRecruiter from "./main-recruiter";

type Competence = {
  competence_id: number;
  name: string | null;
};

type CompetenceSelection = {
  competence_id: number;
  years: number;
  selected: boolean;
};

type PortalClientsidePresenterProps = {
  session: Session | null;
  applicant: boolean;
  applications: UserApplication[] | null;
  competences: Competence[] | null;
};

export default function PortalClientsidePresenter({
  session,
  applicant,
  applications,
  competences,
}: PortalClientsidePresenterProps) {
  const router = useRouter();

  const applyMutation = api.application.applyCompetences.useMutation({
    onSuccess: () => {
      alert("Competences submitted!");
      router.refresh();
    },
    onError: (e) => {
      alert(e.message || "Error submitting competences");
    },
  });

  const [selections, setSelections] = useState<CompetenceSelection[]>(
    competences?.map((c) => ({
      competence_id: c.competence_id,
      years: 0,
      selected: false,
    })) ?? [],
  );

  function toggleSelection(id: number) {
    setSelections((prev) => {
      return prev.map((s) => {
        if (s.competence_id !== id) {
          return s;
        }
        return {
          competence_id: s.competence_id,
          years: s.years,
          selected: !s.selected,
        };
      });
    });
  }

  const updateYears = (id: number, years: number) => {
    setSelections((prev) =>
      prev.map((s) => {
        if (s.competence_id !== id) return s;
        return {
          competence_id: s.competence_id,
          selected: s.selected,
          years: years,
        };
      }),
    );
  };

  const handleSubmit = () => {
    const selected = selections.filter((s) => s.selected);
    applyMutation.mutate(selected);
  };

  const onSignOutACB = () => signOut();

  return (
    <>
      <HeaderView applicant={applicant} onSignOut={onSignOutACB} />

      {applicant ? (
        <MainViewApplicant
          applications={applications}
          competences={competences}
          selections={selections}
          onToggleSelection={toggleSelection}
          onUpdateYears={updateYears}
          onSubmit={handleSubmit}
        />
      ) : (
        <MainViewRecruiter />
      )}
    </>
  );
}
