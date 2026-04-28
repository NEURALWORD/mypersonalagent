import 'server-only';
import { type CurrentUser, detectAuthMode, MOCK_USER } from './types';

/**
 * Server-side current user. Returns the Clerk user when real keys are
 * configured, otherwise a deterministic dev stub (ADR-020). Returns null
 * when Clerk is wired but the request is unauthenticated.
 */
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
	if (detectAuthMode() === 'mock') return MOCK_USER;
	const { currentUser } = await import('@clerk/nextjs/server');
	const user = await currentUser();
	if (!user) return null;
	const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
	return {
		id: user.id,
		email: primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '',
		name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
	};
};

/**
 * Throwing variant for server components / tRPC procedures that require an
 * authenticated user. The caller decides what to do with the throw — the
 * error is intentionally generic so it can be mapped to 401/redirect at the
 * handler boundary.
 */
export const requireCurrentUser = async (): Promise<CurrentUser> => {
	const user = await getCurrentUser();
	if (!user) throw new Error('UNAUTHORIZED');
	return user;
};
