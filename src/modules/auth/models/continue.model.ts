import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

/**
 * Schema for initiating the Email OTP flow.
 * Used to validate the initial request before dispatching a verification code.
 */
export const ContinueSendOTP = {
    body: t.Object({
        email: t.String({
            format: 'email',
            examples: ['user@example.com'],
            description: 'The primary email address where the OTP will be dispatched.'
        })
    }),
    ...CommonResponse
};

/**
 * Schema for validating an Email OTP.
 * Ensures the verification code meets the 6-digit standard length requirement.
 */
export const ContinueVerifyOTP = {
    body: t.Object({
        email: t.String({
            format: 'email',
            description: 'Email associated with the verification attempt.'
        }),
        otp: t.String({
            minLength: 6,
            maxLength: 6,
            examples: ['123456'],
            description: 'A 6-digit numeric or alphanumeric string provided by the user.'
        })
    }),
    ...CommonResponse
};

/**
 * Schema for traditional Email/Password authentication.
 * Supports persistent sessions.
 */
export const ContinuePassword = {
    body: t.Object({
        email: t.String({
            format: 'email',
            description: 'The registered user identifier.'
        }),
        password: t.String({
            description: 'Plaintext password to be verified against the hashed record.'
        })
    }),
    ...CommonResponse
};