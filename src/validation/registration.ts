import { z } from "zod";

// Shared schema for registration
export const registrationSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  pnr: z.string().min(1, "Person number is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Create the type from the schema
export type RegistrationValues = z.infer<typeof registrationSchema>;
