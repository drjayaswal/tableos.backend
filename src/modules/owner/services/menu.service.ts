import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../db';
import { menuItem } from '../../../db/schema';

/**
 * MenuController
 *
 * Manages menu items with store-level isolation.
 * Categories are driven by the `menuCategoryEnum` in the schema —
 * owners pick from the fixed list; there is no separate category table.
 */
export const MenuController = {
    /**
     * listMenu
     * Fetches all non-deleted menu items for a store,
     * returns them pre-grouped by their category field.
     *
     * GET /owner/menu/list?storeId=xxx
     */
    listMenu: async ({ query }: any) => {
        try {
            const { storeId } = query;
            if (!storeId) {
                return { status: 400, message: "storeId is required", data: {} };
            }

            const items = await db
                .select()
                .from(menuItem)
                .where(
                    eq(menuItem.storeId, storeId)
                )
                .orderBy(menuItem.category, menuItem.itemName);
            const grouped: Record<string, typeof items> = {};
            for (const item of items) {
                const cat = item.category ?? "others";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(item);
            }

            return {
                status: 200,
                message: "Menu fetched successfully",
                data: { items, grouped },
            };
        } catch (error: any) {
            console.error("[MENU_LIST_ERROR]:", error);
            return { status: 500, message: "Failed to fetch menu", data: {} };
        }
    },

    /**
     * createMenuItem
     * POST /owner/menu/item
     */
    createMenuItem: async ({ body }: any) => {
        try {
            const {
                storeId, category, itemName, itemDescription,
                basePrice, offerPrice, dietaryType,
                preparationTime, isAvailable,
            } = body;

            const id = crypto.randomUUID();

            await db.insert(menuItem).values({
                id,
                storeId,
                category: category ?? "others",
                itemName,
                itemDescription: itemDescription || null,
                basePrice,
                offerPrice: offerPrice || null,
                dietaryType: dietaryType ?? "veg",
                preparationTime: preparationTime || null,
                isAvailable: isAvailable ?? true,
                labels: [],
                itemImages: [],
                updatedAt: new Date(),
            });

            return {
                status: 200,
                message: "Menu item created",
                data: { itemId: id },
            };
        } catch (error: any) {
            console.error("[MENU_ITEM_CREATE_ERROR]:", error);
            return { status: 500, message: "Failed to create item", data: {} };
        }
    },

    /**
     * updateMenuItem
     * PATCH /owner/menu/item
     */
    updateMenuItem: async ({ body }: any) => {
        try {
            const {
                itemId, category, itemName, itemDescription,
                basePrice, offerPrice, dietaryType,
                preparationTime, isAvailable,
            } = body;

            const existing = await db.query.menuItem.findFirst({
                where: eq(menuItem.id, itemId),
            });

            if (!existing) {
                return { status: 404, message: "Item not found", data: {} };
            }

            await db
                .update(menuItem)
                .set({
                    category: category ?? undefined,
                    itemName: itemName ?? undefined,
                    itemDescription: itemDescription !== undefined
                        ? (itemDescription === "" ? null : itemDescription)
                        : undefined,
                    basePrice: basePrice ?? undefined,
                    offerPrice: offerPrice !== undefined
                        ? (offerPrice === "" ? null : offerPrice)
                        : undefined,
                    dietaryType: dietaryType ?? undefined,
                    preparationTime: preparationTime !== undefined
                        ? (preparationTime === "" ? null : preparationTime)
                        : undefined,
                    isAvailable: isAvailable ?? undefined,
                    updatedAt: new Date(),
                })
                .where(eq(menuItem.id, itemId));

            return { status: 200, message: "Item updated", data: { itemId } };
        } catch (error: any) {
            console.error("[MENU_ITEM_UPDATE_ERROR]:", error);
            return { status: 500, message: "Update failed", data: {} };
        }
    },
    deleteMenuItem: async ({ params }: any) => {
        try {
            const { id } = params;

            const [deletedItem] = await db
                .delete(menuItem)
                .where(eq(menuItem.id, id))
                .returning();

            if (!deletedItem) {
                return { status: 404, message: "Item not found", data: {} };
            }

            return { status: 200, message: "Item deleted successfully", data: {} };
        } catch (error: any) {
            console.error("[MENU_ITEM_DELETE_ERROR]:", error);
            return { status: 500, message: "Delete failed", data: {} };
        }
    },
};