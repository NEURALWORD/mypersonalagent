/**
 * Tiny utility that picks a real client or a mock based on whether a secret
 * is present. Used uniformly across Clerk, Inngest, Langfuse, Sentry,
 * PostHog so every external service has the same fallback story (see
 * ADR-020).
 *
 * Production refuses to start without real keys via the env validator —
 * this factory does not enforce that, it only chooses between the two
 * already-validated options.
 */

export type ProviderMode = 'real' | 'mock';

export type ProviderFactoryOptions<TReal, TMock> = {
	name: string;
	key: string | undefined;
	buildReal: () => TReal;
	buildMock: () => TMock;
	mode?: 'auto' | ProviderMode;
};

export type Provider<TReal, TMock> = {
	mode: ProviderMode;
	client: TReal | TMock;
};

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

export const buildProvider = <TReal, TMock>(
	opts: ProviderFactoryOptions<TReal, TMock>,
): Provider<TReal, TMock> => {
	const decided: ProviderMode =
		opts.mode === 'real' || opts.mode === 'mock' ? opts.mode : isPresent(opts.key) ? 'real' : 'mock';
	if (decided === 'real') {
		return { mode: 'real', client: opts.buildReal() };
	}
	return { mode: 'mock', client: opts.buildMock() };
};

/**
 * Helper for the common case where mocks should log to stdout in dev and
 * be silent in test/prod. `console.warn` is used because biome's noConsole
 * rule allows it.
 */
export const mockLogger = (provider: string): ((event: string, data?: unknown) => void) => {
	if (process.env.NODE_ENV === 'test') return () => undefined;
	const prefix = `[mock:${provider}]`;
	return (event: string, data?: unknown) => {
		if (data === undefined) {
			console.warn(prefix, event);
		} else {
			console.warn(prefix, event, data);
		}
	};
};
