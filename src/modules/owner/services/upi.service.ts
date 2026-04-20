import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { store } from '../../../db/schema';

/**
 * UPIController
 *
 * Get upi id of store for customer.
 */
export const UPIController = {
    /**
     * getUPIId
     * Fetches upi id of store for customer.
     *
     * GET /owner/upi/id
     */
    getUPIId: async ({ body }: any) => {
        try {
            const { storeId } = body;

            if (!storeId) {
                return { status: 400, message: "storeId is required", data: {} };
            }

            const result = await db
                .select({
                    upiId: store.upiId
                })
                .from(store)
                .where(eq(store.id, storeId))
                .limit(1);

            if (result.length === 0) {
                return { status: 404, message: "Store not found", data: {} };
            }

            return {
                status: 200,
                message: "UPI ID fetched successfully",
                data: { upiId: result },
            };
        } catch (error: any) {
            console.error("[GET_UPI_ID_ERROR]:", error);
            return { status: 500, message: "Failed to fetch UPI ID", data: {} };
        }
    }
}