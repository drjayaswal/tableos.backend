import { Server, Socket } from "socket.io";
import { Server as BunEngine } from "@socket.io/bun-engine";
import { db } from "./db";
import { order, table, tableSession } from "./db/schema";
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
                const existingOrder = await db.query.order.findFirst({ where: eq(order.id, orderId) });
                if (!existingOrder) return;
                
                let sessionId = existingOrder.tableSessionId;
                if (!sessionId) {
                    const session = await db.query.tableSession.findFirst({
                        where: and(eq(tableSession.tableId, existingOrder.tableId), eq(tableSession.status, "occupied"))
                    });
                    if (session) sessionId = session.id;
                    else {
                        sessionId = crypto.randomUUID();
                        await db.insert(tableSession).values({ id: sessionId, tableId: existingOrder.tableId, storeId, status: "occupied" });
                        await db.update(table).set({ isOccupied: true }).where(eq(table.id, existingOrder.tableId));
                    }
                }

                await db.update(order)
                    .set({ paymentStatus: "paid", orderStatus: "accepted", tableSessionId: sessionId })
                    .where(eq(order.id, orderId));

                io.to(storeId).emit("order:confirmed", { orderId, tableSessionId: sessionId });
                console.log(`Order ${orderId} verified for store ${storeId}`);
            } catch (err) {
                console.error("Verification error:", err);
            }
        });

        // Triggered when a manager manually declines an order via the dashboard
        socket.on("order:decline", async ({ orderId, storeId }: { orderId: string, storeId: string }) => {
            try {
                await db.update(order)
                    .set({ orderStatus: "declined" })
                    .where(eq(order.id, orderId));

                io.to(storeId).emit("order:declined", { orderId });
                console.log(`Order ${orderId} declined for store ${storeId}`);
            } catch (err) {
                console.error("Decline error:", err);
            }
        });

        // Triggered when a manager accepts a pay-later order
        socket.on("order:accept", async ({ orderId, storeId }: { orderId: string, storeId: string }) => {
            try {
                const existingOrder = await db.query.order.findFirst({ where: eq(order.id, orderId) });
                if (!existingOrder) return;
                
                let sessionId = existingOrder.tableSessionId;
                if (!sessionId) {
                    const session = await db.query.tableSession.findFirst({
                        where: and(eq(tableSession.tableId, existingOrder.tableId), eq(tableSession.status, "occupied"))
                    });
                    if (session) sessionId = session.id;
                    else {
                        sessionId = crypto.randomUUID();
                        await db.insert(tableSession).values({ id: sessionId, tableId: existingOrder.tableId, storeId, status: "occupied" });
                        await db.update(table).set({ isOccupied: true }).where(eq(table.id, existingOrder.tableId));
                    }
                }

                await db.update(order)
                    .set({ orderStatus: "accepted", paymentStatus: "unpaid", tableSessionId: sessionId })
                    .where(eq(order.id, orderId));

                io.to(storeId).emit("order:confirmed", { orderId, tableSessionId: sessionId });
                console.log(`Order ${orderId} accepted for store ${storeId}`);
            } catch (err) {
                console.error("Accept error:", err);
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

        // Triggered when user attempts to pay whole bill
        socket.on("bill:payment:intent", ({ tableSessionId, storeId }: { tableSessionId: string, storeId: string }) => {
            io.to(storeId).emit("bill:payment:intent", { tableSessionId });
            console.log(`Bill payment intent for session ${tableSessionId} broadcasted to store ${storeId}`);
        });

        // Triggered when owner verifies the entire bill payment
        socket.on("verify:session_payment", async ({ tableSessionId, storeId }: { tableSessionId: string, storeId: string }) => {
            try {
                await db.update(order)
                    .set({ paymentStatus: "paid" })
                    .where(and(eq(order.tableSessionId, tableSessionId), eq(order.paymentStatus, "unpaid")));

                io.to(storeId).emit("session:payment:verified", { tableSessionId });
                console.log(`Session payment verified for ${tableSessionId} in store ${storeId}`);
            } catch (err) {
                console.error("Session payment verify error:", err);
            }
        });

        // Triggered when owner declines the entire bill payment
        socket.on("decline:session_payment", async ({ tableSessionId, storeId }: { tableSessionId: string, storeId: string }) => {
            io.to(storeId).emit("session:payment:declined", { tableSessionId });
            console.log(`Session payment declined for ${tableSessionId} in store ${storeId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
}
