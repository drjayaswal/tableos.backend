import { Elysia, t } from 'elysia';
import { OrderManagementController } from '../services/order.management.service';
import { CommonResponse } from '../../../models/common.model';

export const orderRoutes = new Elysia({ prefix: '/orders' })
    .get('/list', (ctx) => OrderManagementController.listOrders(ctx), {
        query: t.Object({ storeId: t.String() }),
        ...CommonResponse
    })
    .patch('/status', (ctx) => OrderManagementController.updateOrderStatus(ctx), {
        body: t.Object({
            orderId: t.String(),
            status: t.Union([
                t.Literal("pending"), t.Literal("confirmed"), 
                t.Literal("preparing"), t.Literal("ready"), 
                t.Literal("served"), t.Literal("cancelled")
            ])
        }),
        ...CommonResponse
    })
    .post('/session-end', (ctx) => OrderManagementController.endSession(ctx), {
        body: t.Object({
            tableSessionId: t.String()
        }),
        ...CommonResponse
    })
    .get('/sessions', (ctx) => OrderManagementController.listActiveSessions(ctx), {
        query: t.Object({ storeId: t.String() }),
        ...CommonResponse
    });
