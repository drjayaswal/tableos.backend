// src/types/response.ts
import { user } from "../db/schema";

/**
 * Standard Response Type
 * Defines the standard shape { status, message, data } for all auth endpoints.
 */
export type StandardResponse<T = any> = {
    status: number;
    message: string;
    data: T | Record<string, never>;
};
/**
 * Local Type Definition for Auth Response
 * Helps with type-safety when parsing JSON from Better Auth.
 */
export type AuthResponseData = {
    user: typeof user.$inferSelect;
    token: string;
    session: any;
};
