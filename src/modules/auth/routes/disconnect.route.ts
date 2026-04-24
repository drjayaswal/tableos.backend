import { Elysia } from 'elysia';
import { AuthController } from '../services/disconnect.service';
import { CommonResponse } from '../../../models/common.model';

/**
 * Authentication Routes
 */
export const authRoutes = new Elysia({ prefix: '/auth' })
    /**
     * @endpoint GET /auth/disconnect
     * @description Disconnects the current session.
     */
    .get('/disconnect', (ctx) => AuthController.disconnect(ctx), {
        ...CommonResponse
    })