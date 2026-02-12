"use client";

import type { RegistrationValues } from "@/validation/registration";

import FormView from "./form";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterClientsidePresenter() {
  const router = useRouter();

  const createUser = api.registration.register.useMutation({
    onSuccess: async (_data, variables) => {
      await signIn("credentials", {
        username: variables.username,
        password: variables.password,
        redirect: false,
      });
      router.push("/portal");
    },
    onError: (error) => {
      if (error.data?.zodError) {
        const validationErrors = error.data.zodError.fieldErrors;
        if (validationErrors) {
          const errorMsg = Object.values(validationErrors)[0];
          alert(errorMsg);
          return;
        }
      }
      alert(error.message || "Internal server error");
    },
  });

  function submitRegistrationACB(values: RegistrationValues) {
    createUser.mutate(values);
  }

  return <FormView onRegister={submitRegistrationACB} />;
}
