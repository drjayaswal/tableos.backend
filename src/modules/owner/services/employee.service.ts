import { and, eq } from 'drizzle-orm';
import { asyncDb, db } from '../../../db';
import { user } from '../../../db/schema';
import { length } from 'better-auth';
/**
 * EmployeeController
 * 
 * Provides logic for managing store employees (staff). 
 * This includes onboarding new employees and updating existing 
 * employee profiles within a designated store.
 */
export const EmployeeController = {
    /** 
     * fireEmployee
     * Removes an employee from the store.
     * Input: { empId: string }
     */
    fireEmployee: async ({ body }: any) => {
        try {
            const { id } = body;
            const [employeeExists] = await db.select().from(user).where(eq(user.id, id));
            if (!employeeExists) {
                return {
                    status: 404,
                    message: "Employee not found",
                    data: {}
                }
            }
            const employeeRegistrationResult = await asyncDb.transaction(async (tx) => {
                await tx.delete(user).where(eq(user.id, id));
                return { id: employeeExists.id };
            });
            return {
                status: 200,
                message: "Employee fired successfully",
                data: { employeeId: employeeRegistrationResult.id }
            };
        } catch (error: any) {
            console.error("[EMPLOYEE_FIRE_ERROR]:", error);
            return {
                status: 500,
                message: "Employee fire failed",
                data: {}
            };
        }
    },
    /** 
     * listEmployee
     * Initializes a new employee (staff role) and links them to a store.
     * Input: { email: string, name: string, storeId: string }
     */
    listEmployee: async () => {
        try {
            const employees = await db.select().from(user).where(eq(user.role, "staff"));
            if (employees.length === 0) {
                return {
                    status: 404,
                    message: "No employee yet",
                    data: {}
                }
            }
            
            return {
                status: 200,
                message: `${employees.length} employee found`,
                data: { employees }
            };
        } catch (error: any) {
            console.error("[EMPLOYEE_RETRIEVAL_ERROR]:", error.message);
            return {
                status: 500,
                message: "Employee retrieval failed",
                data: {}
            };
        }
    },
    /** 
     * createEmployee
     * Initializes a new employee (staff role) and links them to a store.
     * Input: { email: string, name: string, storeId: string }
     */
    createEmployee: async ({ body }: any) => {
        try {
            const { email, name, storeId } = body;
            const [employeeExists] = await db.select().from(user).where(eq(user.email, email));
            if (employeeExists) {
                return {
                    status: 404,
                    message: "Employee already exists",
                    data: {}
                }
            }
            const employeeRegistrationResult = await asyncDb.transaction(async (tx) => {
                const id = crypto.randomUUID();
                await tx.insert(user).values({
                    id,
                    name,
                    email,
                    emailVerified: false,
                    role: "staff",
                    storeId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                return { storeId };
            });
            return {
                status: 200,
                message: "Employee registeration successful",
                data: { storeId: employeeRegistrationResult.storeId }
            };
        } catch (error: any) {
            console.error("[EMPLOYEE_REGISTERATION_ERROR]:", error);
            return {
                status: 500,
                message: "Employee registeration failed",
                data: {}
            };
        }
    },
    /** 
     * updateEmployee
     * Updates an existing employee's details (e.g., name).
     * Input: { name: string, employeeId: string }
     */
    updateEmployee: async ({ body }: any) => {
        try {
            const { name, employeeId } = body;
            const [employeeExists] = await db.select().from(user).where(and(eq(user.id, employeeId),eq(user.role,"staff")));
            if (!employeeExists) {
                return {
                    status: 404,
                    message: "Employee not found",
                    data: {}
                }
            }
            const employeeRegistrationResult = await asyncDb.transaction(async (tx) => {
                await tx.update(user).set({
                    name,
                    updatedAt: new Date(),
                }).where(and(eq(user.id, employeeId),eq(user.role,"staff")));
                return { id: employeeExists.id };
            });
            return {
                status: 200,
                message: "Employee updation successful",
                data: { employeeId: employeeRegistrationResult.id }
            };
        } catch (error: any) {
            console.error("[EMPLOYEE_UPDATE_ERROR]:", error);
            return {
                status: 500,
                message: "Employee updation failed",
                data: {}
            };
        }
    }
};