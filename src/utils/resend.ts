import { Resend } from "resend";
import { env } from "@/env"

if (!env.RESEND_API_KEY) {
    throw new Error(
        "Missing RESEND_API_KEY environment variable-"
    )
}

export const resend = new Resend(env.RESEND_API_KEY);