import { inngest } from '../client';

/**
 * Resets per-user daily AI inference budgets at 00:00 UTC.
 * Phase-0 placeholder: logs and returns. M-001 / AI-002 wire the real
 * Postgres mutation against the `user_daily_budget` table.
 */
export const dailyBudgetRollover = inngest.createFunction(
	{
		id: 'daily-budget-rollover',
		retries: 3,
		onFailure: async ({ event, error }) => {
			console.error('[jobs] daily-budget-rollover dead-letter', { event, error });
		},
	},
	{ cron: '0 0 * * *' },
	async ({ step }) => {
		await step.run('reset-daily-budgets', async () => {
			// TODO(AI-002): UPDATE user_daily_budget SET spent_cents=0 WHERE day < today
			return { ok: true, scope: 'placeholder' };
		});
		return { rolledOverAt: new Date().toISOString() };
	},
);
