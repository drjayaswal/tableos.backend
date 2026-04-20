import { Elysia } from 'elysia';
import { AuthController } from '../services/connect.service';
import { CommonResponse } from '../../../models/common.model';
import { ConnectSendOTP, ConnectVerifyOTP } from '../models/connect.model';

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
     * @endpoint POST /auth/connect/send/otp
     * @description Initiates registration for a new store owner.
     * @validation Ensures email is unique to prevent duplicate account creation.
     */
    .post('/connect/send/otp', (ctx) => AuthController.sendConnectOTP(ctx), {
        ...ConnectSendOTP,
        ...CommonResponse
    })

    /**
     * @endpoint POST /auth/connect/verify/otp
     * @description Finalizes registration and store initialization.
     * @logic 
     * 1. Verifies the connect OTP.
     * 2. Executes an atomic transaction to create the Store entity (including PostGIS geography).
     * 3. Promotes the user to 'owner' and links them to the new store.
     * 4. Establishes the authenticated session.
     */
    .post('/connect/verify/otp', (ctx) => AuthController.verifyConnectOTP(ctx), {
        ...ConnectVerifyOTP,
        ...CommonResponse
    });