"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isDatabaseUnavailableError } from "@/utils/databaseAvailability";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (isDatabaseUnavailableError(error)) {
      router.replace("/service-unavailable");
    }
  }, [error, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#026e6e] to-[#152a2b] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center">
          Something Went Wrong
        </h1>
        <p className="text-xl text-center max-w-2xl">
          Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Retry
        </button>
      </div>
    </main>
  );
}