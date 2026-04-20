import { Elysia } from 'elysia';
import { AuthController } from '../services/continue.service';
import { ContinuePassword, ContinueSendOTP, ContinueVerifyOTP } from '../models/continue.model';
import { CommonResponse } from '../../../models/common.model';

/**
 * Authentication & Onboarding Routes
 * 
 * This module defines the API endpoints for the multi-stage authentication flow.
 * It strictly separates logic for existing owners (Continue) and new registrants (Connect).
 * 
 * Flow Overview:
 * 1. OTP Dispatch: Validates intent and dispatches a secure verification code.
 * 2. OTP Verification: Validates the code and performs necessary state updates (Session/Store creation).
 */
export const authRoutes = new Elysia({ prefix: '/auth' })
    /**
     * @endpoint POST /auth/continue/send/otp
     * @description Dispatches a login OTP for an existing 'owner' account.
     * @validation Checks if account exists AND has 'owner' privileges.
     */
    .post('/continue/send/otp', (ctx) => AuthController.sendContinueOTP(ctx), {
        ...ContinueSendOTP,
        ...CommonResponse
    })

    /**
     * @endpoint POST /auth/continue/verify/otp
     * @description Verifies OTP and initializes an owner session.
     * @logic Syncs session cookies for browsers or returns tokens for mobile apps (Expo/X-Client-Type).
     */
    .post('/continue/verify/otp', (ctx) => AuthController.verifyContinueOTP(ctx), {
        ...ContinueVerifyOTP,
        ...CommonResponse
    })

    /**
     * @endpoint POST /auth/continue/password
     * @description Direct login via email/password for existing owners.
     * @logic Standard credential validation with session/cookie synchronization.
     */
    .post('/continue/password', (ctx) => AuthController.verifyContinuePassword(ctx), {
        ...ContinuePassword,
        ...CommonResponse
    })