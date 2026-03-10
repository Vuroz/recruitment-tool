# Recruitment Tool (IV1201)

This project is a Next.js + tRPC + NextAuth + Prisma recruitment system with two role-driven experiences:
- Applicant portal for availability and competence profile management.
- Recruiter portal for reviewing applications and updating application state.

This README is written as a handover guide for new developers.

## Tech Stack

- Next.js App Router (`src/app`)
- tRPC for typed API layer (`src/server/api`)
- Prisma ORM with PostgreSQL (`prisma/schema.prisma`)
- NextAuth v5 beta using credentials provider (`src/server/auth`)
- Zod schemas for validation (`src/validation`)

## Project Layers

The backend follows a clear layering model:

1. Presentation layer: Next.js routes and React components in `src/app`.
2. API layer: tRPC routers in `src/server/api/routers`.
3. Business logic layer: service modules in `src/server/logic`.
4. Data layer: Prisma client in `src/server/db.ts` and schema in `prisma/schema.prisma`.
5. Validation layer: Zod schemas in `src/validation`.
6. Auth and authorization: NextAuth config and role checks in `src/server/auth`.

### Layer Responsibilities

- `src/app`: route-level rendering, page redirects, and calling tRPC server/client helpers.
- `src/server/api/routers`: request authorization and endpoint composition.
- `src/server/logic`: business rules and database operations.
- `src/validation`: reusable input contracts shared by routers/services.
- `src/server/auth`: session creation, credential verification, role helpers.
- `src/utils`: cross-cutting helpers like DB outage detection and email client wrappers.

## Request Flow

Typical request path:

1. A page or client component triggers a tRPC call.
2. Router procedure validates input via a Zod schema and enforces access rules.
3. Router calls a service function in `src/server/logic`.
4. Service executes Prisma queries/transactions.
5. Result returns through tRPC with typed response payloads.

Relevant entry points:
- `src/app/api/trpc/[trpc]/route.ts`: HTTP adapter for tRPC.
- `src/server/api/trpc.ts`: context creation, base procedures, middleware.
- `src/server/api/root.ts`: router registration.
- `src/trpc/server.ts`: server-side caller/hydration helpers for App Router.

## Authentication And Roles

- NextAuth setup lives in `src/server/auth/config.ts` and `src/server/auth/index.ts`.
- Credentials provider resolves user by username and verifies bcrypt password.
- Session token is enriched with `id`, `username`, and `role`.
- Custom NextAuth types are defined in `src/types/next-auth.d.ts`.
- Role checks use helpers in `src/server/auth/roles.ts` (`isApplicant`, `isRecruiter`).

Authorization happens in routers, for example recruiter-only endpoints in:
- `src/server/api/routers/application.ts`
- `src/server/api/routers/resetPassword.ts`

## Data Model Overview

Core domain tables in `prisma/schema.prisma`:
- `User` (`users` table): account and profile data.
- `role`: role lookup (`applicant`, `recruiter`).
- `competence` and `competence_profile`: skill catalog + applicant experience.
- `availability`: applicant available date ranges.
- `application_state`: recruiter decision tracking.
- `password_reset_token`: reset token lifecycle.

Auth adapter tables:
- `Account`
- `Session`
- `VerificationToken`

Prisma client output is generated into `generated/prisma` (not default `node_modules/.prisma`).

## Local Setup

1. Install dependencies:
`npm install`
2. Configure environment variables.
3. Apply migrations and generate client:
`npm run db:generate`
4. Start dev server:
`npm run dev`

### Required Environment Variables

Environment validation is defined in `src/env.js`.

- `DATABASE_URL`
- `AUTH_SECRET` (required in production)
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `RESEND_API_KEY`
- `NODE_ENV` (`development`, `test`, `production`)

## Useful Scripts

- `npm run dev`: start local dev server.
- `npm run build`: production build.
- `npm run start`: run production server.
- `npm run check`: lint + typecheck.
- `npm run lint` / `npm run lint:fix`: linting.
- `npm run typecheck`: TypeScript only.
- `npm run db:generate`: Prisma migrate dev.
- `npm run db:migrate`: Prisma migrate deploy.
- `npm run db:push`: push schema without migration.
- `npm run db:studio`: Prisma Studio.

## Error Handling And Availability

- `src/server/api/trpc.ts` adds middleware that converts DB connectivity failures into `SERVICE_UNAVAILABLE` tRPC errors.
- `src/utils/databaseAvailability.ts` detects DB-outage signatures and exposes `redirectToServiceUnavailable()` for client-side routing fallback.
- Service-unavailable page is available at `src/app/service-unavailable/page.tsx`.

## Feature Walkthroughs

Applicant portal path:
- Page entry: `src/app/portal/page.tsx`
- Loads role-specific data using server tRPC caller (`api.*` from `src/trpc/server.ts`).
- Applicant data from routers:
- `application.userApplications`
- `competence.getAll`
- `availability.getUserAvailability`

Recruiter portal path:
- Same page entry (`src/app/portal/page.tsx`) branches by role.
- Recruiter data from `application.allApplications`.
- Status updates via `application.updateUserApplicationState` using optimistic concurrency check (`updated_at`).

Password reset path:
- Router: `src/server/api/routers/resetPassword.ts`
- Service: `src/server/logic/resetPasswordService.ts`
- Includes recruiter-issued token creation and email dispatch via Resend.

## How To Add A New Feature

Use this order to keep layering consistent:

1. Define/extend schema in `src/validation/<feature>.ts`.
2. Implement business logic in `src/server/logic/<feature>Service.ts`.
3. Add router procedures in `src/server/api/routers/<feature>.ts`.
4. Register router in `src/server/api/root.ts`.
5. Call from UI in `src/app/...` using `api` helpers.
6. Add Prisma migration if DB changes are needed.

Recommended rules:
- Keep routers thin (auth + input + service call).
- Keep services framework-agnostic and DB-focused.
- Keep validation centralized in Zod modules.
- Prefer transactions for multi-write operations.

## Conventions In This Codebase

- Path alias `@/` points to `src/`.
- Services accept explicit `PrismaClient` argument instead of importing globals directly.
- Role checks should use `isApplicant` / `isRecruiter` helpers.
- New routers must be added manually to `appRouter` in `src/server/api/root.ts`.
- JSDoc comments are used on non-trivial service and router logic to support onboarding.

## Quick File Map

- App routes: `src/app`
- API routers: `src/server/api/routers`
- Business logic: `src/server/logic`
- Auth: `src/server/auth`
- Validation: `src/validation`
- Shared types: `src/types`
- Utilities: `src/utils`
- Prisma schema/migrations: `prisma`
- Generated Prisma client: `generated/prisma`
