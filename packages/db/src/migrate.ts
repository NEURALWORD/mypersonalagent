import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error('DATABASE_URL (or DIRECT_DATABASE_URL) must be set to run migrations.');
	process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

console.warn('Running migrations…');
await migrate(db, { migrationsFolder: './migrations' });
console.warn('Migrations complete.');
await sql.end();
