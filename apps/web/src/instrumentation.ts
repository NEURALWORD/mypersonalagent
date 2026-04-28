import { initSentry } from '@/lib/observability/sentry';

/**
 * Next.js calls this once at server boot. We use it to initialize Sentry
 * (real or mock per ADR-020). Edge runtime doesn't get instrumentation,
 * but the browser path runs Sentry.init from the client bundle.
 */
export const register = (): void => {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		initSentry();
	}
};
