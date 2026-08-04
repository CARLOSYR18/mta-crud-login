import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 1, // en serverless, cada invocación es efímera; un pool grande agota las conexiones de Neon
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });