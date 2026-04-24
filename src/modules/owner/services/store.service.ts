import { desc, eq, sql } from 'drizzle-orm';
import { asyncDb, db } from '../../../db';
import { menuItem, order, store, table, tableSession } from '../../../db/schema';

/**
 * StoreController (Store Management)
 * 
 * Provides centralized logic for managing store profiles. 
 * This includes updating store information, address, and operational configurations.
 */
export const StoreController = {
    /** 
     * updateStore
     * Updates the profile information of an existing store.
     * Input: { storeId, name, address, category, currency, tables, lat, lon, timing }
     */
    updateStore: async ({ body }: any) => {
        try {
            const {
                storeId, name, address, category,
                currency, tables, lat, lon, timing
            } = body;

            const existingStore = await db.query.store.findFirst({
                where: eq(store.id, storeId)
            });

            if (!existingStore) {
                return {
                    status: 404,
                    message: "Store not found.",
                    data: {}
                };
            }

            await asyncDb.transaction(async (tx) => {
                await tx.update(store)
                    .set({
                        name: name ?? undefined,
                        address: address ?? undefined,
                        category: category ?? undefined,
                        currency: currency ?? undefined,
                        tables: tables ?? undefined,
                        timing: timing ?? undefined,
                        location: (lat !== undefined && lon !== undefined)
                            ? sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`
                            : undefined,
                    })
                    .where(eq(store.id, storeId));
            });

            return {
                status: 200,
                message: "Store updated successfully.",
                data: { storeId }
            };
        } catch (error: any) {
            console.error("[STORE_UPDATE_ERROR]:", error);
            return {
                status: 500,
                message: "Failed to update store.",
                data: {}
            };
        }
    },
    /**
     * getStoreData
     * Retrieves a deep-nested dashboard payload for a specific store.
     */
    getStoreData: async ({ params }: any) => {
        try {
            const { storeId } = params;

            const storeData = await db.query.store.findFirst({
                where: eq(store.id, storeId),
                with: {
                    users: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    },
                    tables: true,
                    orders: {
                        orderBy: [desc(order.orderedAt)],
                        limit: 50,
                        with: {
                            details: true
                        }
                    },
                },
            });

            if (!storeData) {
                return {
                    status: 404,
                    message: "Store not found.",
                    data: {}
                };
            }

            const menuItemsCount = await db.query.menuItem.findMany({
                where: eq(menuItem.storeId, storeId),
            });

            const activeSessions = await db.query.tableSession.findMany({
                where: eq(tableSession.storeId, storeId),
            });

            const dashboardPayload = {
                ...storeData,
                menu: menuItemsCount,
                activeSessions: activeSessions,
                stats: {
                    totalTables: storeData.tables.length,
                    occupiedTables: storeData.tables.filter(t => t.isOccupied).length,
                    totalMenuItems: menuItemsCount.length,
                    recentOrdersCount: storeData.orders.length,
                    recentRevenue: storeData.orders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0)
                }
            };

            return {
                status: 200,
                message: "Dashboard data fetched successfully.",
                data: dashboardPayload
            };

        } catch (error: any) {
            console.error("[STORE_FETCH_ERROR]:", error);
            return {
                status: 500,
                message: "Failed to fetch dashboard data.",
                data: {}
            };
        }
    },
    /** 
     * getStore
     * Retrieves the basic profile and configuration of a specific store.
     * Input: { storeId }
     * Output: { storeId, name, address, category, currency, tables, lat, lon, timing }
     */
    getStore: async ({ params }: any) => {
        try {
            const { storeId } = params;
            const existingStore = await db.query.store.findFirst({
                where: eq(store.id, storeId)
            });
            if (!existingStore) {
                return {
                    status: 404,
                    message: "Store not found.",
                    data: {}
                };
            }
            return {
                status: 200,
                message: "Store fetched successfully.",
                data: existingStore
            };
        } catch (error: any) {
            console.error("[STORE_FETCH_ERROR]:", error);
            return {
                status: 500,
                message: "Failed to fetch store.",
                data: {}
            };
        }
    },
    /** 
     * listStoreTables
     * Retrieves individual tables for a store with occupancy status.
     * Input: { storeId }
     */
    listStoreTables: async ({ params }: any) => {
        try {
            const { storeId } = params;
            const tablesList = await db.query.table.findMany({
                where: eq(table.storeId, storeId),
                orderBy: (cols, { asc }) => [asc(cols.tableLabel)],
                columns: { id: true, tableLabel: true, isOccupied: true, isActive: true }
            });
            return {
                status: 200,
                message: "Tables fetched successfully.",
                data: {
                    tables: tablesList
                }
            };
        } catch (error: any) {
            console.error("[TABLES_LIST_ERROR]:", error);
            return {
                status: 500,
                message: "Failed to fetch tables.",
                data: {}
            };
        }
    }
};
