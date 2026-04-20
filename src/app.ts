import { Elysia } from 'elysia';
import { cors } from "@elysiajs/cors";
import { rateLimit } from 'elysia-rate-limit';
import { auth } from './modules/auth/auth';
import { authModuleRoutes } from './modules/auth/routes';
import { ownerModuleRoutes } from './modules/owner/routes';
import { customerModuleRoutes } from './modules/customer/routes';
import { asyncDb } from './db';
import { initSocket, engine } from './socket';
const port = process.env.PORT || 7860;
initSocket();

export const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:3000", process.env.FRONTEND_URL!],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    }),
  )
  .use(rateLimit({ max: 200, duration: 60000 }))
  .state('auth', auth)
  .state('asyncDb', asyncDb)
  .use(authModuleRoutes)
  .use(ownerModuleRoutes)
  .use(customerModuleRoutes)
  
  // Health Check
  .get('/', () => ({ status: 200, message: "tableos is operational" }))

  // This handles the Socket.io handshake specifically
  .all("/socket.io/*", ({ request, server }) => {
    return engine.handleRequest(request, server!);
  })

  .listen({
    port: port,
    ...engine.handler()
  });

console.log(`\ntableos is running at http://${app.server?.hostname}:${app.server?.port}\n`);