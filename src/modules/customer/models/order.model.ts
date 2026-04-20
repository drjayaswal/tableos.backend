import { t } from "elysia";
import { CommonResponse } from "../../../models/common.model";

export const CreateOrder = {
    body: t.Object({
        storeId: t.String(),
        tableId: t.String(),
        items: t.Array(t.Object({
            menuItemId: t.String(),
            quantity: t.Integer({ minimum: 1 }),
            customerNote: t.Optional(t.String())
        }))
    }),
    ...CommonResponse
};

export const GetMenuBySlug = {
    params: t.Object({
        slug: t.String()
    }),
    ...CommonResponse
};
