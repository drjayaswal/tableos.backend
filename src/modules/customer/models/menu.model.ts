import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

/**
 * List all menu items for the customer
 */
export const ListMenuItems = {
    body: t.Object({
        storeId: t.String({ description: "The store to fetch items for." })
    }),
    ...CommonResponse,
};
