import { protectedProcedure, router } from '../trpc';

export const chatRouter = router({
	list: protectedProcedure.query(() => ({ conversations: [] as Array<{ id: string }> })),
});
