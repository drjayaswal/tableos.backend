import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

const DietaryTypeEnum = t.Union([
    t.Literal("veg"),
    t.Literal("non-veg"),
    t.Literal("vegan"),
    t.Literal("jain"),
]);

/**
 * List all menu items for a store (grouped by category)
 */
export const ListMenuItems = {
    query: t.Object({
        storeId: t.String({ description: "The store to fetch items for." }),
    }),
    ...CommonResponse,
};

/**
 * Create a new menu item
 */
export const CreateMenuItem = {
    body: t.Object({
        storeId: t.String(),
        category: t.Union([
            t.Literal("beverages"),
            t.Literal("coffee_tea"),
            t.Literal("alcohol"),
            t.Literal("appetizers"),
            t.Literal("soups"),
            t.Literal("salads"),
            t.Literal("small_plates"),
            t.Literal("sandwiches"),
            t.Literal("entrees"),
            t.Literal("mains_land"),
            t.Literal("mains_sea"),
            t.Literal("pasta_pizza"),
            t.Literal("sides"),
            t.Literal("sauces_dips"),
            t.Literal("desserts"),
            t.Literal("pastries"),
            t.Literal("kids_menu"),
            t.Literal("specials"),
            t.Literal("others"),
        ], { description: "Category enum value from schema." }),
        itemName: t.String({ minLength: 1 }),
        itemDescription: t.Optional(t.String()),
        basePrice: t.String({ description: "Decimal price as string." }),
        offerPrice: t.Optional(t.String()),
        dietaryType: DietaryTypeEnum,
        preparationTime: t.Optional(t.String({ description: "e.g. '10-15 mins'" })),
        isAvailable: t.Optional(t.Boolean({ default: true })),
    }),
    ...CommonResponse,
};

/**
 * Update an existing menu item
 */
export const UpdateMenuItem = {
    body: t.Object({
        itemId: t.String(),
        category: t.Optional(t.Union([
            t.Literal("beverages"),
            t.Literal("coffee_tea"),
            t.Literal("alcohol"),
            t.Literal("appetizers"),
            t.Literal("soups"),
            t.Literal("salads"),
            t.Literal("small_plates"),
            t.Literal("sandwiches"),
            t.Literal("entrees"),
            t.Literal("mains_land"),
            t.Literal("mains_sea"),
            t.Literal("pasta_pizza"),
            t.Literal("sides"),
            t.Literal("sauces_dips"),
            t.Literal("desserts"),
            t.Literal("pastries"),
            t.Literal("kids_menu"),
            t.Literal("specials"),
            t.Literal("others"),
        ])),
        itemName: t.Optional(t.String()),
        itemDescription: t.Optional(t.String()),
        basePrice: t.Optional(t.String()),
        offerPrice: t.Optional(t.String()),
        dietaryType: t.Optional(DietaryTypeEnum),
        preparationTime: t.Optional(t.String()),
        isAvailable: t.Optional(t.Boolean()),
    }),
    ...CommonResponse,
};

/**
 * Delete (soft) a menu item
 */
export const DeleteMenuItem = {
    params: t.Object({
        id: t.String(),
    }),
    ...CommonResponse,
};