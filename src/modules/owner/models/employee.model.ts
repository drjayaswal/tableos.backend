import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";
/**
 * Employee Onboarding & Creation
 * A comprehensive model that captures identity, email, and storeId
 * configurations required to initialize a new Employee entity.
 */
export const FireEmployee
 = {
    body: t.Object({
        id: t.String({
            description: 'The ID of the employee to be fired.'
        })
    }),
    ...CommonResponse
};
/**
 * Employee Onboarding & Creation
 * A comprehensive model that captures identity, email, and storeId
 * configurations required to initialize a new Employee entity.
 */
export const CreateEmployee = {
    body: t.Object({
        // Identity & Verification
        name: t.String({
            description: 'The legal or display name of the store.'
        }),
        email: t.String({
            format: 'email',
            description: 'The email address used during the verification request.'
        }),
        storeId: t.String({
            description: 'The ID of the store to which the employee is being added.'
        })
    }),
    ...CommonResponse
};
/**
 * Employee Updation
 * A comprehensive model that captures identity, email, and storeId
 * configurations required to update an existing Employee entity.
 */
export const UpdateEmployee = {
    body: t.Object({
        // Identity & Verification
        name: t.String({
            description: 'The legal or display name of the employee.'
        }),
        employeeId: t.String({
            description: 'The ID of the store to which the employee is being added.'
        })
    }),
    ...CommonResponse
};