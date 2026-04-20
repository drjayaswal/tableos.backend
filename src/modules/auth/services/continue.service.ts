import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { user } from '../../../db/schema';
import { auth } from '../auth';

interface AuthResponseData {
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
        name?: string;
        image?: string;
    };
    token?: string; // Only present if using mobile/bearer tokens
}
/**
 * ContinueController (Auth)
 * 
 * Provides logic for authenticating existing users. 
 * This includes OTP-based sign-in and password-based sign-in 
 * specifically tailored for returning owners and staff.
 */
export const AuthController = {
    /** 
     * sendContinueOTP
     * Initiates login for an existing owner by sending a verification OTP.
     * Input: { email: string }
     * Workflow: Validates user existence and 'owner' role -> Dispatches OTP via Better Auth.
     */
    sendContinueOTP: async ({ body }: any) => {
        try {
            const { email } = body;
            const foundUser = await db.query.user.findFirst({
                where: eq(user.email, email)
            });
            if (!foundUser) {
                return {
                    status: 400,
                    message: `No account with ${email} exists`,
                    data: {}
                };
            }
            if (foundUser.role !== "owner") {
                return {
                    status: 400,
                    message: `Account with ${email} exists but is not an owner`,
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
     * verifyContinueOTP
     * Validates OTP and establishes a session for an existing owner.
     * Input: { email: string, otp: string }
     * Workflow: Verifies OTP -> Sets session cookie/token based on client type.
    */
    verifyContinueOTP: async ({ body, headers, set }: { body: any, headers: any, set: any }) => {
        try {
            const { email, otp } = body;
            const foundUser = await db.query.user.findFirst({
                where: eq(user.email, email)
            });

            if (!foundUser || foundUser.role !== "owner") {
                set.status = 400;
                return { status: 400, message: "Invalid account or role", data: {} };
            }

            const authResponse = await auth.api.signInEmailOTP({
                body: { email, otp, rememberMe: true },
                headers: new Headers(headers),
                asResponse: true
            });

            if (!authResponse.ok) {
                set.status = 401;
                return { status: 401, message: "Invalid OTP", data: {} };
            }

            const result = await authResponse.json() as AuthResponseData;

            // Apply the cookie fix for Production (SameSite=None)
            const authCookies = authResponse.headers.getSetCookie();
            set.headers['set-cookie'] = [
                ...authCookies,
                `user_role=owner; Path=/; Max-Age=604800; SameSite=None; Secure`,
                `store_id=${foundUser.storeId}; Path=/; Max-Age=604800; SameSite=None; Secure`
            ];

            return {
                status: 200,
                message: "Verification successful.",
                data: {
                    user: { ...result.user, role: 'owner' },
                    storeId: foundUser.storeId,
                    token: result.token
                }
            };
        } catch (error: any) {
            set.status = 500;
            return { status: 500, message: error.message, data: {} };
        }
    },
    /** 
       * verifyContinuePassword
       * Authenticates an owner using email and password.
       * Input: { email: string, password: string }
       * Workflow: Validates credentials -> Sets session cookie/token.
      */

    verifyContinuePassword: async ({ body, headers, set }: { body: any, headers: any, set: any }) => {
        try {
            const { email, password } = body;
            const foundUser = await db.query.user.findFirst({
                where: eq(user.email, email)
            });

            if (!foundUser) {
                set.status = 400;
                return { status: 400, message: "User not found", data: {} };
            }

            const authResponse = await auth.api.signInEmail({
                body: { email, password, rememberMe: true },
                headers: new Headers(headers),
                asResponse: true
            });

            if (!authResponse.ok) {
                set.status = 401;
                return { status: 401, message: "Invalid credentials", data: {} };
            }

            const result = await authResponse.json() as AuthResponseData;

            const authCookies = authResponse.headers.getSetCookie();

            set.headers['set-cookie'] = [
                ...authCookies,
                `user_role=staff; Path=/; Max-Age=604800; SameSite=None; Secure`,
                `store_id=${foundUser.storeId}; Path=/; Max-Age=604800; SameSite=None; Secure`
            ];

            return {
                status: 200,
                message: "Login successful.",
                data: {
                    user: { ...result.user, role: 'owner' },
                    storeId: foundUser.storeId,
                    token: result.token
                }
            };
        } catch (error: any) {
            set.status = 500;
            return { status: 500, message: error.message, data: {} };
        }
    }
};