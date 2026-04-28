import { TRPCError } from '@trpc/server';
import { afterEach, describe, expect, it } from 'vitest';
import type { Context } from '../trpc';
import { appRouter } from './_app';

const makeCtx = (userId: string | null): Context => ({
	userId,
	req: new Request('http://localhost/api/trpc'),
});

const reset = async (caller: ReturnType<typeof appRouter.createCaller>) => {
	await caller.settings.__resetForTests();
};

describe('settings router', () => {
	afterEach(async () => {
		const caller = appRouter.createCaller(makeCtx('usr_test'));
		await reset(caller);
	});

	it('rejects unauthenticated callers', async () => {
		const caller = appRouter.createCaller(makeCtx(null));
		await expect(caller.settings.get()).rejects.toBeInstanceOf(TRPCError);
	});

	it('returns defaults for a fresh user', async () => {
		const caller = appRouter.createCaller(makeCtx('usr_new'));
		const settings = await caller.settings.get();
		expect(settings.responseStyle).toBe('concise');
		expect(settings.defaultMeetingDuration).toBe(30);
		expect(settings.timezone).toBe('UTC');
		await caller.settings.__resetForTests();
	});

	it('round-trips a partial update', async () => {
		const caller = appRouter.createCaller(makeCtx('usr_test'));
		const updated = await caller.settings.update({
			responseStyle: 'detailed',
			timezone: 'Europe/Rome',
		});
		expect(updated.responseStyle).toBe('detailed');
		expect(updated.timezone).toBe('Europe/Rome');
		expect(updated.defaultMeetingDuration).toBe(30); // default preserved
		const fetched = await caller.settings.get();
		expect(fetched).toEqual(updated);
	});

	it('merges successive updates instead of overwriting', async () => {
		const caller = appRouter.createCaller(makeCtx('usr_test'));
		await caller.settings.update({ responseStyle: 'detailed' });
		const merged = await caller.settings.update({ defaultMeetingDuration: 45 });
		expect(merged.responseStyle).toBe('detailed');
		expect(merged.defaultMeetingDuration).toBe(45);
	});

	it('rejects invalid input via zod', async () => {
		const caller = appRouter.createCaller(makeCtx('usr_test'));
		await expect(caller.settings.update({ defaultMeetingDuration: 9999 })).rejects.toBeInstanceOf(
			TRPCError,
		);
	});

	it('isolates state per user', async () => {
		const a = appRouter.createCaller(makeCtx('usr_a'));
		const b = appRouter.createCaller(makeCtx('usr_b'));
		await a.settings.update({ timezone: 'America/New_York' });
		const aSettings = await a.settings.get();
		const bSettings = await b.settings.get();
		expect(aSettings.timezone).toBe('America/New_York');
		expect(bSettings.timezone).toBe('UTC');
		await a.settings.__resetForTests();
		await b.settings.__resetForTests();
	});
});
