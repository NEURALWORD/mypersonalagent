import { mockLogger, scrubPii } from '@exec/shared';

const log = mockLogger('sentry');

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

export type SentryMode = 'real' | 'mock';

export const detectSentryMode = (
	env: Partial<Record<string, string | undefined>> = process.env,
): SentryMode => (isPresent(env.SENTRY_DSN) ? 'real' : 'mock');

/**
 * Initialize Sentry. Called once from instrumentation.ts at boot. In real
 * mode AI-001 / staging swap the body for `Sentry.init()` from
 * @sentry/nextjs; until then we log via mockLogger so the boot path is
 * exercised without the SDK installed (ADR-020).
 */
export const initSentry = (): void => {
	if (detectSentryMode() === 'mock') {
		log('init', { mode: 'mock' });
		return;
	}
	log('init', { mode: 'real' });
	// AI-001 / staging: Sentry.init({ dsn: env.SENTRY_DSN, ... });
};

/**
 * Capture an exception with PII scrubbed from any attached extras.
 * Real mode forwards to Sentry.captureException; mock mode logs.
 */
export const captureException = (err: unknown, extras?: Record<string, unknown>): void => {
	const scrubbed = extras ? scrubPii(extras) : undefined;
	if (detectSentryMode() === 'mock') {
		log('captureException', { error: serializeError(err), extras: scrubbed });
		return;
	}
	log('captureException', { error: serializeError(err), extras: scrubbed });
};

const serializeError = (err: unknown): { name: string; message: string } => {
	if (err instanceof Error) return { name: err.name, message: err.message };
	return { name: 'NonError', message: String(err) };
};
