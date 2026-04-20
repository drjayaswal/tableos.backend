// middleware/authGuard.ts
import { auth } from '../modules/auth/auth';

export const requireAuth = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) throw new Error("Unauthorized");

  return session;
};