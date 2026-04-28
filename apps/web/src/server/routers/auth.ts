import { protectedProcedure, router } from '../trpc';

export const authRouter = router({
	me: protectedProcedure.query(({ ctx }) => ({ userId: ctx.userId })),
});
