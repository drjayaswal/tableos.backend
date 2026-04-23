import { eq, and, inArray, not } from 'drizzle-orm';
import { asyncDb, db } from '../../../db';
import { store, menuItem, table, tableSession, order, orderItem } from '../../../db/schema';
import { io } from '../../../socket';

/**
 * OrderController (Customer Side)
 */
export const OrderController = {
    /**
     * getPublicMenu
     * Fetches public menu for a store scan.
     */
    getPublicMenu: async ({ params }: any) => {
        try {
            const { slug } = params;
            const targetStore = await db.query.store.findFirst({
                where: eq(store.slug, slug)
            });

            if (!targetStore) throw new Error("Store not found");

            // const categories = await db.query.menuCategory.findMany({
            //     where: and(eq(menuCategory.storeId, targetStore.id), eq(menuCategory.isActive, true)),
            //     orderBy: (cols, { asc }) => [asc(cols.sortOrder)],
            //     with: {
            //         items: {
            //             where: and(eq(menuItem.isAvailable, true), eq(menuItem.deletedAt, null)),
            //             orderBy: (cols, { asc }) => [asc(cols.itemName)]
            //         }
            //     }
            // });

            return {
                status: 200,
                message: "Menu fetched",
                // data: { store: targetStore, categories }
            };
        } catch (error: any) {
            return { status: 404, message: error.message, data: {} };
        }
    },

    /**
     * checkStatus
     * Polling fallback for order status.
     */
    checkStatus: async ({ query }: any) => {
        try {
            const { orderId } = query;
            const targetOrder = await db.query.order.findFirst({
                where: eq(order.id, orderId)
            });

            if (!targetOrder) throw new Error("Order not found");

            return {
                status: 200,
                message: "Status fetched",
                data: { paymentStatus: targetOrder.paymentStatus, orderStatus: targetOrder.orderStatus }
            };
        } catch (error: any) {
            return { status: 404, message: error.message, data: {} };
        }
    },

    /**
     * createOrder
     * Handles ordering logic with sessions and transactions.
     */
    createOrder: async (ctx: any) => {
        try {
            const { body, server } = ctx;
            const { storeId, tableId, items, paymentStatus } = body;

            // 1. Verify table exists and belongs to store
            const targetTable = await db.query.table.findFirst({
                where: and(eq(table.id, tableId), eq(table.storeId, storeId))
            });
            if (!targetTable) throw new Error("Invalid table");

            // 2. Get Session
            let session = await db.query.tableSession.findFirst({
                where: and(
                    eq(tableSession.tableId, tableId),
                    eq(tableSession.status, "occupied")
                )
            });

            // 3. Fetch Items to validate prices (prevent spoofing)
            const itemIds = items.map((i: any) => i.menuItemId);
            const dbItems = await db.query.menuItem.findMany({
                where: inArray(menuItem.id, itemIds)
            });
            
            console.log("itemIds", dbItems);
            if (dbItems.length !== items.length) throw new Error("Some items are invalid");

            // 4. Calculate Totals
            let subtotal = 0;
            const orderItemsToInsert = items.map((item: any) => {
                const dbItem = dbItems.find(i => i.id === item.menuItemId)!;
                const price = dbItem.offerPrice || dbItem.basePrice;
                const itemTotal = parseFloat(price.toString()) * item.quantity;
                subtotal += itemTotal;

                return {
                    id: crypto.randomUUID(),
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    soldAtPrice: price.toString(),
                    itemNameAtOrder: dbItem.itemName,
                    customerNote: item.customerNote
                };
            });

            const totalAmount = subtotal; // Can add tax logic here later

            // 5. Transactional Insert
            const orderId = crypto.randomUUID();
            await asyncDb.transaction(async (tx) => {
                // Create Order
                const tax = 0.05;
                await tx.insert(order).values({
                    id: orderId,
                    storeId,
                    tableId,
                    tableSessionId: session ? session.id : null,
                    orderStatus: "pending",
                    paymentStatus: paymentStatus || "unpaid",
                    paymentMethod: "upi",
                    taxAmount: (subtotal * tax).toString(),
                    billSubtotal: subtotal.toString(),
                    totalAmount: (subtotal + (subtotal * tax)).toString(),
                });

                // Create Order Items
                for (const oi of orderItemsToInsert) {
                    await tx.insert(orderItem).values({
                        ...oi,
                        orderId
                    });
                }

                // Update Table Status only if session exists
                if (session) {
                    await tx.update(table)
                        .set({ isOccupied: true })
                        .where(eq(table.id, tableId));
                }
            });

            // 6. Broadcast via WebSockets
            if (io) {
                io.to(storeId).emit("order:new", {
                    orderId,
                    tableId,
                    tableLabel: targetTable.tableLabel,
                    tableSessionId: session ? session.id : null,
                    totalAmount: totalAmount.toFixed(2),
                    items: orderItemsToInsert
                });
            }

            return {
                status: 200,
                message: "Order placed successfully",
                data: { 
                    orderId, 
                    tableSessionId: session ? session.id : null,
                    totalAmount: totalAmount.toFixed(2)
                }
            };

        } catch (error: any) {
            console.error("[ORDER_CREATE_ERROR]:", error);
            return {
                status: 500,
                message: error.message || "Failed to place order",
                data: {}
            };
        }
    },

    /**
     * getSessionBill
     * Aggregates all orders for a session into a professional bill.
     */
    getSessionBill: async ({ query }: any) => {
        try {
            const { tableSessionId } = query;
            if (!tableSessionId) throw new Error("Session ID is required");

            const session = await db.query.tableSession.findFirst({
                where: eq(tableSession.id, tableSessionId),
                with: {
                    store: true,
                    table: true,
                    orders: {
                        where: not(inArray(order.orderStatus, ["cancelled", "declined"])),
                        with: {
                            details: true
                        }
                    }
                }
            });

            if (!session) throw new Error("Session not found");

            return {
                status: 200,
                message: "Bill fetched",
                data: session
            };
        } catch (error: any) {
            return { status: 404, message: error.message, data: {} };
        }
    }
};
