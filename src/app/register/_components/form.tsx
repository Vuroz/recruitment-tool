"use client";

import type React from "react";

import type { RegistrationValues } from "@/validation/registration";

type FormViewProps = {
    onRegister: (values: RegistrationValues) => void;
};

type FormItem = [type: string, name: keyof RegistrationValues, label: string];

export default function FormView({ onRegister }: FormViewProps) {
    const formItems: FormItem[] = [
        ["text", "fname", "First Name"],
        ["text", "lname", "Last Name"],
        ["email", "email", "Email"],
        ["text", "pnr", "Person Number"],
        ["text", "username", "Username"],
        ["password", "password", "Password"],
    ];

    function renderFormItemCB(item: FormItem) {
        const type = item[0];
        const name = item[1];
        const label = item[2];

        return (
            <div key={name} className="grid grid-cols-[1fr_2fr] gap-4 pb-2">
                <label htmlFor={name}>{label}</label>
                <input
                    className="bg-white/20 rounded"
                    id={name}
                    name={name}
                    type={type}
                />
            </div>
        );
    }

    function onRegisterACB(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const values: RegistrationValues = {
            fname: String(formData.get("fname") ?? "").trim(),
            lname: String(formData.get("lname") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            pnr: String(formData.get("pnr") ?? "").trim(),
            username: String(formData.get("username") ?? "").trim(),
            password: String(formData.get("password") ?? ""),
        };

        onRegister(values);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-[5rem]">
                    Register Account
                </h1>
                <form
                    className="container flex-col w-auto bg-white/10 p-4 rounded-xl"
                    onSubmit={onRegisterACB}
                >
                    {formItems.map(renderFormItemCB)}

                    <button
                        type="submit"
                        className="w-full bg-white/20 hover:bg-white/30 rounded cursor-pointer"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </main>
    );
}