import { z } from "zod";

export const availabilitySchema = z.object({
    from_date: z.coerce.date(),
    to_date: z.coerce.date()
}).refine((data) => data.from_date < data.to_date, {
    message: "From date must be before to date",
});

export const availabilityIdSchema = z.object({
    id: z.number(),
});

export type AvailabilityValues = z.infer<typeof availabilitySchema>;
export type AvailabilityIdValue = z.infer<typeof availabilityIdSchema>;