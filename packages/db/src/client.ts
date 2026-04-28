import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Options } from 'postgres';
import * as schema from './schema';

export type DbSchema = typeof schema;
export type Database = ReturnType<typeof createDbClient>['db'];

export type CreateDbClientOptions = {
	max?: number;
	idleTimeout?: number;
	connectTimeout?: number;
	ssl?: Options<Record<string, never>>['ssl'];
};

/**
 * Build a Drizzle client + the underlying postgres-js connection. Caller owns
 * the lifecycle and should call `await sql.end()` on shutdown. Kept as a
 * factory (no module-level singleton) so importing @exec/db is a no-op for
 * tests, scripts, and any context that does not actually need a live DB.
 */
export const createDbClient = (url: string, opts: CreateDbClientOptions = {}) => {
	const sql = postgres(url, {
		max: opts.max ?? 10,
		idle_timeout: opts.idleTimeout ?? 30,
		connect_timeout: opts.connectTimeout ?? 10,
		...(opts.ssl !== undefined ? { ssl: opts.ssl } : {}),
	});
	const db = drizzle(sql, { schema });
	return { db, sql };
};

export { schema };
