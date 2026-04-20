import { Elysia } from 'elysia';
import { MenuController } from '../services/menu.service';
import {
    ListMenuItems,
    CreateMenuItem,
    UpdateMenuItem,
    DeleteMenuItem,
} from '../models/menu.model';

/**
 * Menu Routes
 *
 * All routes are under /owner/menu (prefix set in ownerModuleRoutes).
 *
 * Categories are fixed enum values — no category CRUD routes needed.
 * The owner selects a category when creating/updating an item.
 */
export const menuRoutes = new Elysia({ prefix: '/menu' })
    /**
     * @endpoint GET /list
     * @description Fetch all non-deleted menu items for a store, grouped by category.
     */
    .get('/list', (ctx) => MenuController.listMenu(ctx), {
        ...ListMenuItems,
    })

    /**
     * @endpoint POST /item
     * @description Create a new menu item under a chosen enum category.
     */
    .post('/item', (ctx) => MenuController.createMenuItem(ctx), {
        ...CreateMenuItem,
    })

    /**
     * @endpoint PATCH /item
     * @description Update any field on an existing menu item.
     */
    .patch('/item', (ctx) => MenuController.updateMenuItem(ctx), {
        ...UpdateMenuItem,
    })

    /**
     * @endpoint DELETE /item/:id
     * @description Soft-delete a menu item (sets deletedAt).
     */
    .delete('/item/:id', (ctx) => MenuController.deleteMenuItem(ctx), {
        ...DeleteMenuItem,
    });