import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import * as schema from "../../db/schema";
import path from "path";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);
const htmlPath = path.join(process.cwd(), "./src/utility/mail/emailTemplate.html");
const emailTemplate = fs.readFileSync(htmlPath, "utf-8");
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
        const logoPath = path.join(process.cwd(), "./src/utility/mail/tableOS-logo.png");
        const logoBuffer = fs.readFileSync(logoPath);
        const html = emailTemplate
          .replace('{{OTP}}', otp)
          .replace('{{URL}}', process.env.FRONTEND_URL || 'https://tableos.app')
          .replace('{{LOGO}}', 'cid:tableos-logo');

        await resend.emails.send({
          from: 'TableOS <onboarding@resend.dev>',
          to: email,
          subject: `${otp} is your TableOS verification code`,
          html,
          attachments: [
            {
              filename: 'tableOS-logo.png',
              content: logoBuffer,
              contentId: 'tableos-logo',
              contentType: "image/png"
            }
          ]
        });
      }
    }),
  ],

  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [process.env.FRONTEND_URL],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  advanced: {
    useSecureCookies: PRODUCTION,
    defaultCookieAttributes: {
      sameSite: PRODUCTION ? "none" : "lax",
      secure: PRODUCTION,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 8,
    },
  }
});