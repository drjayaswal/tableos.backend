// src/db/index.ts
import { neon, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL missing');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzleHttp(sql, { schema });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const asyncDb = drizzleWs(pool, { schema });