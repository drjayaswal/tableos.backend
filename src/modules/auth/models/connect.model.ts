import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

/**
 * Reusable Operational Schemas
 */
const DaySchema = t.Object({
    is_open: t.Boolean(),
    open_time: t.String({ pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', examples: ['09:00'] }),
    close_time: t.String({ pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', examples: ['21:00'] }),
});

const TimingSchema = t.Object({
    monday: DaySchema,
    tuesday: DaySchema,
    wednesday: DaySchema,
    thursday: DaySchema,
    friday: DaySchema,
    saturday: DaySchema,
    sunday: DaySchema,
});

/**
 * Onboarding Initiation Schema
 */
export const ConnectSendOTP = {
    body: t.Object({
        email: t.String({
            format: 'email',
            description: 'The email address used for administrative identity and store ownership.'
        })
    }),
    ...CommonResponse
};

/**
 * Store Onboarding & OTP Verification Schema
 */
export const ConnectVerifyOTP = {
    body: t.Object({
        // Identity & Verification
        email: t.String({
            format: 'email',
            description: 'The email address used during the verification request.'
        }),
        otp: t.String({
            minLength: 6,
            maxLength: 6,
            pattern: '^[0-9]{6}$',
            description: 'The 6-digit verification code sent to the user email.'
        }),

        // Store Profile Information
        name: t.Optional(t.String({
            minLength: 1,
            description: 'The legal or display name of the store.'
        })),
        address: t.String({
            minLength: 5,
            description: 'The physical street address of the establishment.'
        }),
        category: t.String({
            description: 'The business classification (e.g., Cafe, Restaurant, Hotel).'
        }),
        currency: t.Optional(t.String({
            default: 'INR',
            description: 'The primary currency used for transactions and billing.'
        })),

        tables: t.Number({
            minimum: 1,
            description: 'Total number of table units available for management.'
        }),

        lat: t.Number({
            minimum: -90,
            maximum: 90,
            description: 'Decimal latitude for GPS mapping.'
        }),
        lon: t.Number({
            minimum: -180,
            maximum: 180,
            description: 'Decimal longitude for GPS mapping.'
        }),

        password: t.Optional(t.String({
            minLength: 8,
            description: 'The secure administrative password for owner access.'
        })),

        timing: t.Optional(
            t.Object(TimingSchema.properties, { 
                description: 'Structured weekly schedule for the store.' 
            })
        ),
    }),
    ...CommonResponse
};