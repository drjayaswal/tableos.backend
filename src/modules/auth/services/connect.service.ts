import { eq, sql } from 'drizzle-orm';
import { asyncDb, db } from '../../../db';
import { store, table, user } from '../../../db/schema';
import { auth } from '../auth';
import type { AuthResponseData } from '../../../types/response';
import { generateRandomLabel } from '../../../utility/app';

/**
 * ConnectController (Auth)
 * 
 * Provides logic for the initial registration and onboarding flow. 
 * This includes sending verification OTPs to new users and executing 
 * the atomic transaction to create both the user and their associated store.
 */
export const AuthController = {
    /** 
     * sendConnectOTP
     * Initiates registration for a new user by sending a verification OTP.
     * Input: { email: string }
     * Workflow: Ensures email is not already in use -> Dispatches OTP.
    */
    sendConnectOTP: async ({ body }: any) => {
        try {
            const { email } = body;
            const foundUser = await db.query.user.findFirst({
                where: eq(user.email, email)
            });
            if (foundUser) {
                return {
                    status: 400,
                    message: `An account with ${email} already exists.`,
                    data: {}
                };
            }
            const response = await auth.api.sendVerificationOTP({
                body: { email, type: "sign-in" },
            });
            if (!response.success) throw new Error("Verification provider failed.");
            return {
                status: 200,
                message: "OTP sent successfully!",
                data: { email, sentAt: Date.now() }
            };
        } catch (error: any) {
            return {
                status: 500,
                message: error.message || "Internal server error",
                data: {}
            };
        }
    },
    /** 
     * verifyConnectOTP
     * Finalizes registration, creates a Store, and promotes User to 'owner'.
     * Input: { email, otp, name, address, category, currency, tables, lat, lon, timing }
     * Workflow: Verifies OTP -> Atomic Transaction (Creates Store with PostGIS point + Updates User) -> Sets session tokens.
    */
    verifyConnectOTP: async ({ body, headers, set }: { body: any, headers: any, set: any }) => {
        try {
            const {
                email, otp, name, address, category,
                currency, tables, lat, lon, timing
            } = body;
            const authResponse = await auth.api.signInEmailOTP({
                body: { email, otp },
                headers: new Headers(headers),
                asResponse: true
            });
            if (!authResponse.ok) {
                return {
                    status: 401,
                    message: "Invalid or expired verification OTP",
                    data: {}
                };
            }
            const result = await authResponse.json() as AuthResponseData;
            const authCookies = authResponse.headers.getSetCookie();
            const storeRegistrationResult = await asyncDb.transaction(async (tx) => {
                const storeId = crypto.randomUUID();
                const baseSlug = (name || 'store').toLowerCase().replace(/\s+/g, '-');
                const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
                await tx.insert(store).values({
                    id: storeId,
                    name: name || `${email}'s Store`,
                    slug: uniqueSlug,
                    address,
                    category,
                    currency: currency || "INR",
                    tables,
                    timing: timing || {},
                    ownerEmail: email,
                    location: sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`
                });
                if (tables && tables > 0) {
                    const tablesToInsert = Array.from({ length: tables }).map(() => ({
                        id: crypto.randomUUID(),
                        storeId: storeId,
                        tableLabel: generateRandomLabel(),
                        isOccupied: false,
                        isActive: true,
                    }));
                    await tx.insert(table).values(tablesToInsert);
                }
                await tx.update(user)
                    .set({
                        storeId: storeId,
                        role: 'owner',
                        name: name || result.user.name
                    })
                    .where(eq(user.id, result.user.id));
                return { storeId };
            });
            set.headers['set-cookie'] = [
                ...authCookies,
                `user_role=owner; Path=/; Max-Age=604800; SameSite=None; Secure`,
                `store_id=${storeRegistrationResult.storeId}; Path=/; Max-Age=604800; SameSite=None; Secure`
            ];
            return {
                status: 200,
                message: "Authentication successful and store created.",
                data: {
                    user: { ...result.user, role: 'owner' },
                    storeId: storeRegistrationResult.storeId,
                    token: result.token
                }
            };
        } catch (error: any) {
            console.error("[AUTH_VERIFY_STORE_ERROR]:", error);
            set.status = 500;
            return {
                status: 500,
                message: error.message.includes('slug') ? "Store name taken" : "Registration failed",
                data: {}
            };
        }
    }
}