import { eq, and } from 'drizzle-orm';
import { db, asyncDb } from '../../../db';
import { order, tableSession, table } from '../../../db/schema';
import { io } from '../../../socket';


export const OrderManagementController = {
    /**
     * endSession
     * Closes a table session and frees the table.
     */
    endSession: async ({ body, server }: any) => {
        try {
            const { tableSessionId } = body;
            const session = await db.query.tableSession.findFirst({
                where: eq(tableSession.id, tableSessionId),
                with: { table: true }
            });

            if (!session) throw new Error("Session not found");

            await asyncDb.transaction(async (tx) => {
                await tx.update(tableSession)
                    .set({ 
                        status: 'vacant', 
                        endTime: new Date() 
                    })
                    .where(eq(tableSession.id, tableSessionId));

                await tx.update(table)
                    .set({ isOccupied: false })
                    .where(eq(table.id, session.tableId));
            });

            if (io) {
                io.to(session.storeId).emit("session:closed", { 
                    tableSessionId, 
                    tableLabel: session.table?.tableLabel 
                });
            }

            return {
                status: 200,
                message: "Session ended successfully",
                data: {}
            };
        } catch (error: any) {
            return { status: 500, message: error.message, data: {} };
        }
    },

    /**
     * updateOrderStatus
     * Updates status and broadcasts to customer.
     */
    updateOrderStatus: async ({ body, server }: any) => {
        try {
            const { orderId, status } = body;

            const existingOrder = await db.query.order.findFirst({
                where: eq(order.id, orderId)
            });

            if (!existingOrder) throw new Error("Order not found");

            await db.update(order)
                .set({ orderStatus: status })
                .where(eq(order.id, orderId));

            // Broadcast to customer
            // Broadcast to store room
            if (io) {
                io.to(existingOrder.storeId).emit("order:status:updated", { 
                    orderId, 
                    status 
                });
            }

            return {
                status: 200,
                message: `Order status updated to ${status}`,
                data: { orderId, status }
            };
        } catch (error: any) {
            return { status: 500, message: error.message, data: {} };
        }
    },

    /**
     * listOrders
     * Fetches all orders for a store.
     */
    listOrders: async ({ query }: any) => {
        try {
            const { storeId } = query;
            const orders = await db.query.order.findMany({
                where: eq(order.storeId, storeId),
                orderBy: (cols, { desc }) => [desc(cols.orderedAt)],
                with: {
                    details: true,
                    table: true
                }
            });

            return {
                status: 200,
                message: "Orders fetched",
                data: { orders }
            };
        } catch (error: any) {
            return { status: 500, message: "Failed to fetch orders", data: {} };
        }
    },

    /**
     * listActiveSessions
     * Fetches all active table sessions for a store.
     */
    listActiveSessions: async ({ query }: any) => {
        try {
            const { storeId } = query;
            const sessions = await db.query.tableSession.findMany({
                where: and(eq(tableSession.storeId, storeId), eq(tableSession.status, 'occupied')),
                with: {
                    table: true
                }
            });

            return {
                status: 200,
                message: "Active sessions fetched",
                data: { sessions }
            };
        } catch (error: any) {
            console.error(error);
            return { status: 500, message: "Failed to fetch sessions", data: {} };
        }
    }
};
