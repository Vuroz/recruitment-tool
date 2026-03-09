"use client";

import type { Session } from "next-auth";
import type { UserApplication } from "@/types/application";
import type { availability } from "generated/prisma";


import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isDatabaseUnavailableError } from "@/utils/databaseAvailability";

import HeaderView from "../../_components/header";
import MainViewApplicant from "./main-applicant";
import MainViewRecruiter from "./main-recruiter";
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

type PortalClientsidePresenterProps = {
  session: Session | null;
  applicant: boolean;
  applications: UserApplication[] | null;
  competences: Competence[] | null;
  availabilities: availability[] | null;
};

export default function PortalClientsidePresenter({
  session,
  applicant,
  applications,
  competences,
  availabilities,
}: PortalClientsidePresenterProps) {
  const router = useRouter();

  const applyMutation = api.application.applyCompetences.useMutation({
    onSuccess: () => {
      router.refresh();
      alert("Competences submitted!");
    },
    onError: (e) => {
      if (isDatabaseUnavailableError(e)) {
        return;
      }
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

  const addAvailabilityMutation = api.availability.addAvailability.useMutation({
    onSuccess: () => {
      router.refresh();
      alert("Availability added!");
    },
    onError: (error) => {
      if (isDatabaseUnavailableError(error)) {
        return;
      }
      if (error.data?.zodError) {
        const validationErrors = error.data.zodError.fieldErrors;
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          const errorMsg = Object.values(validationErrors)[0];
          alert(errorMsg);
          return;
        }
        const formErrors = error.data.zodError.formErrors;
        if (formErrors && Object.keys(formErrors).length > 0) {
          const errorMsg = Object.values(formErrors)[0];
          alert(errorMsg);
          return;
        }
      }
      alert(error.message || "Internal server error");
    },
  });

  const handleAddAvailability = (values: AvailabilityValues) => {
    addAvailabilityMutation.mutate(values);
  };

  const removeAvailabilityMutation = api.availability.removeAvailability.useMutation({
    onSuccess: () => {
      router.refresh();
      alert("Availability removed!");
    }
  });
  const handleRemoveAvailability = (id: number) => {
    removeAvailabilityMutation.mutate({ id });
  };

  return (
    <>
      <HeaderView applicant={applicant} onSignOut={onSignOutACB} />

      {applicant ? (
        <MainViewApplicant
          applications={applications}
          competences={competences}
          availabilities={availabilities}
          selections={selections}
          onToggleSelection={toggleSelection}
          onUpdateYears={updateYears}
          onSubmit={handleSubmit}
          onAddAvailability={handleAddAvailability}
          onRemoveAvailability={handleRemoveAvailability}
        />
      ) : (
        <MainViewRecruiter applications={applications} />
      )}
    </>
  );
}
