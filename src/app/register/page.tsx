import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import RegisterClientsidePresenter from "./_components/register-client";

export default async function RegisterPresenter() {
  const session = await auth();

  if (session?.user) {
    redirect("/portal");
  }

  return <RegisterClientsidePresenter />;
}