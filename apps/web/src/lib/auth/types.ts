export type CurrentUser = {
	id: string;
	email: string;
	name: string | null;
};

export type AuthMode = 'real' | 'mock';

export const MOCK_USER: CurrentUser = {
	id: 'usr_dev',
	email: 'dev@local.test',
	name: 'Dev User',
};

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

type EnvLike = Partial<Record<string, string | undefined>>;

/**
 * Server-side mode detection — uses both keys because both are present on
 * the server in real mode.
 */
export const detectAuthMode = (env: EnvLike = process.env as EnvLike): AuthMode =>
	isPresent(env.CLERK_SECRET_KEY) && isPresent(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
		? 'real'
		: 'mock';

/**
 * Client-side mode detection — only NEXT_PUBLIC_* is shipped to the browser,
 * so we infer purely from the publishable key. Server-side this is consistent
 * with `detectAuthMode` because real mode requires both keys.
 */
export const detectClientAuthMode = (publishableKey: string | undefined): AuthMode =>
	isPresent(publishableKey) ? 'real' : 'mock';
