import { t } from "elysia";

/**
 * Global API Response Contract
 * * This model serves as the standard "Envelope" for all outgoing responses.
 * It ensures the Frontend team receives a predictable JSON structure, 
 * regardless of the specific business logic or resource requested.
 */
export const CommonResponse = {
    response: t.Object({
        /**
         * HTTP-equivalent or internal application status code.
         * Used by the client to determine high-level success or failure.
         */
        status: t.Number({
            examples: [200, 401, 500]
        }),

        /**
         * Human-readable feedback or error description.
         * Suitable for UI toast notifications or debugging.
         */
        message: t.String({
            examples: ["Success", "Internal Server Error"]
        }),

        /**
         * The polymorphic payload.
         * Uses t.Any() to allow for dynamic objects, arrays, or empty {} 
         * without triggering Elysia's response validation guard.
         */
        data: t.Any({
            default: {},
            description: "The primary payload of the response. Can be any valid JSON structure."
        })
    })
};