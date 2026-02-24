// ============================================================
// lib/validations/auth.schema.ts
// Zod schemas for login and register forms.
// Zod validates user input BEFORE it reaches the server.
// If validation fails, the form shows an error message —
// and the API is never even called. Clean and safe.
// ============================================================

import { z } from "zod";

// ---- Login Schema ----
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")               // can't be empty
        .email("Please enter a valid email"),       // must look like an email

    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

// ---- Register Schema ----
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required")
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name is too long"),

        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(128, "Password is too long"),

        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    // Cross-field validation: password and confirmPassword must match.
    // .refine() lets you write custom validation logic across multiple fields.
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // this tells the form WHICH field to show the error on
    });

// ---- TypeScript Types (auto-generated from the schemas above) ----
// z.infer<> extracts the TypeScript type from a Zod schema.
// So we don't have to write the types manually — Zod does it for us!
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
