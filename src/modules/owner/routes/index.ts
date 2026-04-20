import { Elysia } from 'elysia';
import { employeeRoutes } from './employee.route';
import { menuRoutes } from './menu.route';
import { orderRoutes } from './order.route';
import { storeRoutes } from './store.route';

export const ownerModuleRoutes = new Elysia({ prefix: '/owner' })
    .use(employeeRoutes)
    .use(storeRoutes)
    .use(menuRoutes)
    .use(orderRoutes);
