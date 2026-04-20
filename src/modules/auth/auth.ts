import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import { emailOTP } from "better-auth/plugins";
import * as schema from "../../db/schema";
const PRODUCTION = true;
/**
 * Environment Validation
 * Ensures critical authentication variables are loaded before initialization.
 */
if (!process.env.FRONTEND_URL || !process.env.BETTER_AUTH_SECRET) {
  throw new Error("Missing critical environment variables: FRONTEND_URL or BETTER_AUTH_SECRET");
}

/**
 * Better Auth Configuration
 * Core authentication engine using Drizzle ORM and Email OTP strategy.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    }
  }),

  /**
   * Authentication Strategies
   * Primary: Traditional Email/Password
   * Secondary: Passwordless Email OTP (via Plugin)
   */
  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        // Log implementation for development; replace with SMTP provider (e.g., Resend, SendGrid) in production.
        console.log(`[AUTH] Dispatching OTP: ${otp} | Recipient: ${email} | Intent: ${type}`);
      },
    }),
  ],

  trustedOrigins: [process.env.FRONTEND_URL],

  secret: process.env.BETTER_AUTH_SECRET,
  /**
   * Session Management
   * Configures a 7-day session lifetime with aggressive server-side cookie caching 
   * to reduce database lookup overhead on frequent requests.
   */
session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: PRODUCTION ? "none" : "lax",
      secure: PRODUCTION,
      httpOnly: true,
      // Increase this to 8 days to give a 1-day buffer for time-zone mismatches
      maxAge: 60 * 60 * 24 * 8, 
    },
  }
});