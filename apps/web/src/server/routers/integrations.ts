import { protectedProcedure, router } from '../trpc';

export const integrationsRouter = router({
	list: protectedProcedure.query(() => ({
		integrations: [] as Array<{ id: string; provider: string; status: string }>,
	})),
});
