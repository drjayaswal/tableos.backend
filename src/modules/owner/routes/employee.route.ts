import { Elysia } from 'elysia';
import { EmployeeController } from '../services/employee.service';
import { CommonResponse } from '../../../models/common.model';
import { CreateEmployee, FireEmployee, UpdateEmployee } from '../models/employee.model';

/**
 * Creation & Onboarding Routes
 * 
 * This module defines the API endpoints for the multi-stage employee creation flow.
 * 
 * Flow Overview:
 * 1. Employee Creation: Validates intent and dispatches a secure verification code.
 * 2. Employee Updation: Validates the code and performs necessary state updates (Session/Store creation).
 */
export const employeeRoutes = new Elysia()
    /**
     * @endpoint GET /list/employee
     * @description Lists all employees.
     */
    .get('/list/employee', () => EmployeeController.listEmployee(), {
        ...CommonResponse
    })
    /**
     * @endpoint GET /list/employee
     * @description Lists all employees.
     */
    .post('/fire/employee', (ctx) => EmployeeController.fireEmployee(ctx), {
        ...FireEmployee,
        ...CommonResponse
    })

/**
     * @endpoint POST /create/employee
     * @description Initiates employee creation.
     * @validation Ensures email is unique to prevent duplicate account creation.
     */
    .post('/create/employee', (ctx) => EmployeeController.createEmployee(ctx), {
        ...CreateEmployee,
        ...CommonResponse
    })

    /**
     * @endpoint POST /update/employee
     * @description Updates an existing employee's profile information.
     * @logic 
     * 1. Verifies the existence of the employee.
     * 2. Executes an update on the User record to reflect changes like name or contact details.
     * 3. Returns the status of the update operation.
     */
    .post('/update/employee', (ctx) => EmployeeController.updateEmployee(ctx), {
        ...UpdateEmployee,
        ...CommonResponse
    });