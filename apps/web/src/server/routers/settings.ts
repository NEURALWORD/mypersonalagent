import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const settingsSchema = z.object({
	responseStyle: z.enum(['concise', 'detailed']).default('concise'),
	defaultMeetingDuration: z.number().int().min(5).max(240).default(30),
	timezone: z.string().min(1).default('UTC'),
});

export type Settings = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/**
 * In-memory store keyed by userId. This is an intentional Phase-0
 * placeholder so the tRPC round-trip is exercisable without a live
 * Postgres connection. M-001 swaps the body of get/update for Drizzle
 * reads/writes against users.preferences.
 */
const STORE = new Map<string, Settings>();

export const settingsRouter = router({
	get: protectedProcedure.query(({ ctx }) => STORE.get(ctx.userId) ?? DEFAULT_SETTINGS),

	update: protectedProcedure.input(settingsSchema.partial()).mutation(({ ctx, input }) => {
		const current = STORE.get(ctx.userId) ?? DEFAULT_SETTINGS;
		const next = settingsSchema.parse({ ...current, ...input });
		STORE.set(ctx.userId, next);
		return next;
	}),

	__resetForTests: protectedProcedure.mutation(({ ctx }) => {
		STORE.delete(ctx.userId);
		return { ok: true };
	}),
});
