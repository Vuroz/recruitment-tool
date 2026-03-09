import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { registrationRouter } from "@/server/api/routers/registration";
import { applicationRouter } from "@/server/api/routers/application";
import { competenceRouter } from "@/server/api/routers/competence";
import { availabilityRouter } from "@/server/api/routers/availability";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  registration: registrationRouter,
  application: applicationRouter,
  competence: competenceRouter,
  availability: availabilityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
