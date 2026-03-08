import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import RegisterClientsidePresenter from "./_components/register-client";

/**
 * Server-side presenter that handles authentication checks before rendering the registration page.
 * Redirects to the portal if the user is already authenticated.
 */
export default async function RegisterPresenter() {
  const session = await auth();

  if (session?.user) {
    redirect("/portal");
  }

  return <RegisterClientsidePresenter />;
}