import { protectedProcedure, router } from '../trpc';

export const memoryRouter = router({
	recallStub: protectedProcedure.query(() => ({ memories: [] as Array<{ id: string }> })),
});
