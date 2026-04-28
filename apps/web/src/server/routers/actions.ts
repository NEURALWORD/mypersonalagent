import { protectedProcedure, router } from '../trpc';

export const actionsRouter = router({
	pending: protectedProcedure.query(() => ({ actions: [] as Array<{ id: string }> })),
});
