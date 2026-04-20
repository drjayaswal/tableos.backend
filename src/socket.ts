import { Server, Socket } from "socket.io";
import { Server as BunEngine } from "@socket.io/bun-engine";
import { db } from "./db";
import { order, tableSession } from "./db/schema";
import { eq, and } from "drizzle-orm";

export let io: Server;
export let engine: BunEngine;

export function initSocket() {
    // Initialize standard Socket.IO server with CORS configuration
    io = new Server({
        cors: {
            origin: ["http://localhost:3000", process.env.FRONTEND_URL!],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    engine = new BunEngine();
    io.bind(engine);

    io.on("connection", (socket: Socket) => {
        console.log("Client connected:", socket.id);

        // Allow clients (customers and managers) to join a specific store's room
        // This enables targeted broadcasting of events per store.
        socket.on("join", (storeId: string) => {
            socket.join(storeId);
            console.log(`Socket ${socket.id} joined room: ${storeId}`);
        });

        // Triggered when a manager verifies a customer's UPI payment via the dashboard
        socket.on("verify:payment", async ({ orderId, storeId }: { orderId: string, storeId: string }) => {
            try {
                await db.update(order)
                    .set({ paymentStatus: "paid", orderStatus: "confirmed" })
                    .where(eq(order.id, orderId));

                io.to(storeId).emit("order:confirmed", { orderId });
                console.log(`Order ${orderId} verified for store ${storeId}`);
            } catch (err) {
                console.error("Verification error:", err);
            }
        });

        // Triggered when a manager manually declines an order via the dashboard
        socket.on("order:decline", async ({ orderId, storeId }: { orderId: string, storeId: string }) => {
            try {
                await db.update(order)
                    .set({ orderStatus: "cancelled" })
                    .where(eq(order.id, orderId));

                io.to(storeId).emit("order:declined", { orderId });
                console.log(`Order ${orderId} declined for store ${storeId}`);
            } catch (err) {
                console.error("Decline error:", err);
            }
        });

        // Triggered when a manager ends an active table session, freeing up the table
        socket.on("session:close", async ({ tableSessionId, storeId }: { tableSessionId: string, storeId: string }) => {
            try {
                await db.update(tableSession)
                    .set({ status: "vacant", endTime: new Date() })
                    .where(eq(tableSession.id, tableSessionId));
                
                io.to(storeId).emit("session:closed", { tableSessionId });
            } catch (err) {
                console.error("Session close error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
}
