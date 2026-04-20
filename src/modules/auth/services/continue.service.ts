import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { user } from '../../../db/schema';
import { auth } from '../auth';
import type { AuthResponseData } from '../../../types/response';

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
            const authResponse = await auth.api.signInEmailOTP({
                body: {
                    email, otp,
                    rememberMe: true,
                },
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
            const setCookie = authResponse.headers.get('set-cookie');
            if (setCookie) {
                set.headers['set-cookie'] = [setCookie,
                    `user_role=owner; Path=/; Max-Age=604800;`,
                    `store_id=${foundUser.storeId}; Path=/; Max-Age=604800;`
                ]
            }
            const userAgent = headers['user-agent']?.toLowerCase() || '';
            const isMobileApp = userAgent.includes('expo') || headers['x-client-type'] === 'mobile-app';
            return {
                status: 200,
                message: "Verification successful.",
                data: {
                    user: { ...result.user, role: 'owner' },
                    token: isMobileApp ? result.token : undefined
                }
            };
        } catch (error: any) {
            console.error("[AUTH_VERIFY_CONTINUE_OTP_ERROR]:", error);
            return {
                status: 500,
                message: error.message || "Internal server error", data: {}
            };
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
                return {
                    status: 400,
                    message: `No account with ${email} exists`,
                    data: {}
                };
            }
            const authResponse = await auth.api.signInEmail({
                body: {
                    email: email,
                    password: password,
                    rememberMe: true,
                },
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
            const setCookie = authResponse.headers.get('set-cookie');
            if (setCookie) set.headers['set-cookie'] = [setCookie,
                `user_role=staff; Path=/; Max-Age=604800;`,
                `store_id=${foundUser.storeId}; Path=/; Max-Age=604800;`
            ]
            const userAgent = headers['user-agent']?.toLowerCase() || '';
            const isMobileApp = userAgent.includes('expo') || headers['x-client-type'] === 'mobile-app';
            return {
                status: 200,
                message: "Verification successful.",
                data: {
                    user: { ...result.user, role: 'owner' },
                    token: isMobileApp ? result.token : undefined
                }
            };
        } catch (error: any) {
            console.error("[AUTH_VERIFY_CONTINUE_PASSWORD_ERROR]:", error);
            return {
                status: 500,
                message: error.message || "Internal server error", data: {}
            };
        }
    }
};