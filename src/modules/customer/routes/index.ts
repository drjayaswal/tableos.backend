import { Elysia } from 'elysia';
import { menuRoutes } from './menu.route';
import { orderRoutes } from './order.route';

export const customerModuleRoutes = new Elysia({ prefix: '/customer' })
    .use(menuRoutes)
    .use(orderRoutes)
