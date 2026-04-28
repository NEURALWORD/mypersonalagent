import { eq } from 'drizzle-orm';
import type { Database } from './client';
import { users } from './schema/users';

export type UpsertUserInput = {
	clerkId: string;
	email: string;
	name: string | null;
	timezone?: string;
	locale?: string;
};

/**
 * Upsert a user keyed by email (Clerk's primary email). Returns the resulting
 * row. Used by the Clerk webhook on user.created / user.updated events.
 *
 * The Clerk user id is currently stashed in the `agentVoiceId` column as a
 * placeholder until M-001 lands the proper auth-providers table. This is a
 * known compromise -- documented in BLOCKERS as a follow-up.
 */
export const upsertUserByEmail = async (db: Database, input: UpsertUserInput) => {
	const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
	if (existing.length > 0) {
		const [updated] = await db
			.update(users)
			.set({
				name: input.name,
				...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
				...(input.locale !== undefined ? { locale: input.locale } : {}),
			})
			.where(eq(users.email, input.email))
			.returning();
		return updated;
	}
	const [created] = await db
		.insert(users)
		.values({
			email: input.email,
			name: input.name,
			...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
			...(input.locale !== undefined ? { locale: input.locale } : {}),
		})
		.returning();
	return created;
};
