import { Elysia } from 'elysia';
import { MenuController } from '../services/menu.service';
import {
    ListMenuItems
} from '../models/menu.model';
import { CommonResponse } from '../../../models/common.model';

/**
 * Menu Routes
 * All routes are under /customer/menu
 */
export const menuRoutes = new Elysia({ prefix: '/menu' })
    /**
     * @endpoint POST /list
     * @description Fetch all menu items of the store for the customer.
     */
    .post('/list', (ctx) => MenuController.listMenu(ctx), {
        ...ListMenuItems,
        ...CommonResponse,
    })