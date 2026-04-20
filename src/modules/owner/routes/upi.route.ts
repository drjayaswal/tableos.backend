import { Elysia } from 'elysia';
import { UPIController } from '../services/upi.service';
import { CommonResponse } from '../../../models/common.model';

/**
 * Menu Routes
 * All routes are under /owner/upi
 */
export const upiRoutes = new Elysia({ prefix: '/upi' })
    /**
     * @endpoint GET /id
     * @description Fetch upi id of the store for the customer.
     */
    .get('/id', (ctx) => UPIController.getUPIId(ctx), {
        ...CommonResponse,
    })