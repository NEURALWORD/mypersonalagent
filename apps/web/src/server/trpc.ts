import { AppError, AuthError } from '@exec/shared';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { ZodError } from 'zod';
import { getCurrentUser } from '@/lib/auth/server';

export type Context = {
	userId: string | null;
	req: Request;
};

/**
 * Build a tRPC context from a Next.js fetch handler request. The current
 * user is resolved via the auth abstraction (real Clerk or mock per
 * ADR-020). DB clients are lazily constructed inside individual procedures
 * rather than per-request to keep the connection pool predictable.
 */
export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
	const user = await getCurrentUser();
	return { userId: user?.id ?? null, req };
};

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter: ({ shape, error }) => {
		const cause = error.cause;
		const zodIssues =
			cause && typeof cause === 'object' && 'issues' in cause ? (cause as ZodError).issues : null;
		const appCode = cause instanceof AppError ? cause.code : null;
		return {
			...shape,
			data: {
				...shape.data,
				zodIssues,
				appCode,
			},
		};
	},
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'Sign in required',
			cause: new AuthError('UNAUTHORIZED', 'Sign in required'),
		});
	}
	return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
