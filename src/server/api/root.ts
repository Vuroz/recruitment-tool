import { registrationRouter } from "@/server/api/routers/registration";
import { applicationRouter } from "@/server/api/routers/application";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { competenceRouter } from "@/server/api/routers/competence";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  registration: registrationRouter,
  application: applicationRouter,
  competence: competenceRouter,
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
