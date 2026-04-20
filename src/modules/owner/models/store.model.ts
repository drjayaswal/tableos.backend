import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

const DaySchema = t.Object({
    is_open: t.Boolean(),
    open_time: t.String({
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        examples: ['09:00', '18:30']
    }),
    close_time: t.String({
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        examples: ['17:00', '23:59']
    }),
});

export const Timing = t.Object({
    monday: DaySchema,
    tuesday: DaySchema,
    wednesday: DaySchema,
    thursday: DaySchema,
    friday: DaySchema,
    saturday: DaySchema,
    sunday: DaySchema,
});
/**
 * Store Updation
 * A comprehensive model that captures identity, email, and storeId
 * configurations required to update an existing Store entity.
 */
export const UpdateStore = {
    body: t.Object({
        storeId: t.String({
            description: 'The unique identifier of the store to be updated.'
        }),
        name: t.Optional(t.String({
            minLength: 1,
            description: 'The legal or display name of the store.'
        })),
        address: t.Optional(t.String({
            description: 'The physical street address of the establishment.'
        })),
        category: t.Optional(t.String({
            description: 'The business classification (e.g., Cafe, Restaurant, Hotel).'
        })),
        currency: t.Optional(t.String({
            default: 'INR',
            description: 'The primary currency used for transactions and billing.'
        })),
        tables: t.Optional(t.Number({
            minimum: 1,
            description: 'Total number of table units available for management.'
        })),
        lat: t.Optional(t.Number({
            minimum: -90,
            maximum: 90,
            description: 'Decimal latitude.'
        })),
        lon: t.Optional(t.Number({
            minimum: -180,
            maximum: 180,
            description: 'Decimal longitude.'
        })),
        timing: t.Optional(
            t.Object({
                monday: DaySchema,
                tuesday: DaySchema,
                wednesday: DaySchema,
                thursday: DaySchema,
                friday: DaySchema,
                saturday: DaySchema,
                sunday: DaySchema,
            }, { description: 'Structured weekly schedule for the store.' })
        ),
    }),
    ...CommonResponse
};