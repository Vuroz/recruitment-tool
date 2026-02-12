"use client";

import type { RegistrationValues } from "@/validation/registration";

import FormView from "./_components/form"

import { api } from "@/trpc/react";

export default function RegisterPresenter() {
    const createUser = api.registration.register.useMutation({
        onSuccess: () => {
            console.log("ya");
        },
        onError: (error) => {
            if (error.data?.zodError) {
                const validationErrors = error.data.zodError.fieldErrors
                if (validationErrors) {
                    const errorMsg = Object.values(validationErrors)[0];
                    alert(errorMsg);
                    return;
                }
            }
            alert(error.message || "Internal server error");
        }
    })

    function submitRegistrationACB(values: RegistrationValues) {
        // TODO: send values to registration mutation
        createUser.mutate(values);
        console.log(values);
    }
    return (
        <FormView onRegister={submitRegistrationACB}/>
    )
}