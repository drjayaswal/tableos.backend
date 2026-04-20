import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { store, menuItem } from '../../../db/schema';

/**
 * MenuController
 *
 * Lists menu items of store's for customer.
 */
export const MenuController = {
    /**
     * listMenu
     * Fetches all non-deleted menu items for a store,
     * returns them pre-grouped by their category field.
     *
     * POST /customer/menu/list
     */
    listMenu: async ({ body }: any) => {
        try {
            const { storeId } = body;
            if (!storeId) {
                return { status: 400, message: "storeId is required", data: {} };
            }

            const items = await db
                .select()
                .from(menuItem)
                .where(
                    eq(menuItem.storeId, storeId)
                )
                .orderBy(menuItem.isAvailable, menuItem.itemName);

            const targetStore = await db.query.store.findFirst({
                where: eq(store.id, storeId)
            });

            return {
                status: 200,
                message: "Menu fetched successfully",
                data: { items, upiId: targetStore?.upiId, storeName: targetStore?.name },
            };
        } catch (error: any) {
            console.error("[MENU_LIST_ERROR]:", error);
            return { status: 500, message: "Failed to fetch menu", data: {} };
        }
    }
}