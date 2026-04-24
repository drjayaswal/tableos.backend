import { auth } from '../auth';

/**
 * AuthController (Auth)
 * 
 * Provides logic for the disconnect flow.
 */
export const AuthController = {

    /** 
     * disconnect
     * Disconnects the current session.
     * Input: {  }
     * Workflow: Disconnects the current session.
    */
    disconnect: async ({ set, request }: { set: any, request: Request }) => {
        try {
            await auth.api.signOut({
            headers: request.headers
        });
 
            return {
                status: 200,
                message: "Disconnected successfully!",
                data: {}
            };
        } catch (error: any) {
            console.error("[AUTH_DISCONNECT_ERROR]:", error);
            set.status = 500;
            return {
                status: 500,
                message: "Internal Server Error",
                data: {}
            };
        }
    }
}