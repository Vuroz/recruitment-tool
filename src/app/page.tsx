import { auth } from "@/server/auth";
// import { HydrateClient } from "@/trpc/server";

import HomeView from "./_components/home";

export default async function HomePresenter() {
  const session = await auth();

  return (
    // <HydrateClient>
      <HomeView session={session} />
    // </HydrateClient>
  );
}
