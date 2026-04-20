import { Elysia } from 'elysia';
import { authRoutes as connectRoutes } from './connect.routes';
import { authRoutes as continueRoutes } from './continue.route';

export const authModuleRoutes = new Elysia()
    .use(connectRoutes)
    .use(continueRoutes);
