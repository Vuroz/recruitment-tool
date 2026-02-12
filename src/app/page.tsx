import { auth } from "@/server/auth";
// import { HydrateClient } from "@/trpc/server";

import HomeView from "./_components/home";
import { redirect } from "next/navigation";

export default async function HomePresenter() {
  const session = await auth();

  if (session?.user) {
    redirect("/portal");
  }

  return (
    // <HydrateClient>
      <HomeView session={session} />
    // </HydrateClient>
  );
}
