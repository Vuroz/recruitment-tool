import { z } from "zod";

// Shared schema for user id
export const userIdSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
});

// Shared schema for application state change
export const applicationStateChangeSchema = z.object({
    user_id: z.string().min(1, "User ID is required"),
    update_at: z.date().nullable(),
    new_state: z.enum(["unhandled", "accepted", "rejected"]),
});

// Create the type from the schema
export type UserIdValues = z.infer<typeof userIdSchema>;
export type ApplicationStateChangeValues = z.infer<typeof applicationStateChangeSchema>;
