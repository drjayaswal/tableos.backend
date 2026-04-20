import { Elysia, t } from 'elysia';
import { OrderController } from '../services/order.service';

export const orderRoutes = new Elysia({ prefix: '/order' })
    .post('/create', (ctx) => OrderController.createOrder(ctx), {
        body: t.Object({
            storeId: t.String(),
            tableId: t.String(),
            items: t.Array(t.Object({
                menuItemId: t.String(),
                itemName: t.String(),
                quantity: t.Number(),
                price: t.String(),
                customerNote: t.Optional(t.String())
            })),
            totalAmount: t.String()
        })
    })
    .get('/status', (ctx) => OrderController.checkStatus(ctx), {
        query: t.Object({
            orderId: t.String()
        })
    })
    .get('/bill', (ctx) => OrderController.getSessionBill(ctx), {
        query: t.Object({
            tableSessionId: t.String()
        })
    });
