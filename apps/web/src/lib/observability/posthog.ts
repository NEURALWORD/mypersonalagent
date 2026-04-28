import { mockLogger } from '@exec/shared';

const log = mockLogger('posthog');

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

export type PosthogMode = 'real' | 'mock';

export const detectPosthogMode = (
	env: Partial<Record<string, string | undefined>> = process.env,
): PosthogMode =>
	isPresent(env.NEXT_PUBLIC_POSTHOG_KEY) && isPresent(env.NEXT_PUBLIC_POSTHOG_HOST)
		? 'real'
		: 'mock';

export type AnalyticsEvent = {
	name: string;
	properties?: Record<string, unknown>;
	userId?: string;
};

/**
 * Hashes a user id for non-prod environments so traces, logs, and any
 * leaked PostHog payloads do not expose the raw Clerk id. Uses a stable
 * non-cryptographic FNV-1a (32-bit) — sufficient for opaque attribution,
 * deliberately not strong enough for identity correlation.
 */
const hashIdForNonProd = (userId: string): string => {
	let hash = 0x811c9dc5;
	for (let i = 0; i < userId.length; i++) {
		hash ^= userId.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `u_${hash.toString(16)}`;
};

export const ph = {
	identify: (userId: string, traits?: Record<string, unknown>): void => {
		const id = process.env.NODE_ENV === 'production' ? userId : hashIdForNonProd(userId);
		if (detectPosthogMode() === 'mock') {
			log('identify', { id, traits });
			return;
		}
		// AI-001 / staging: import 'posthog-js' and call posthog.identify(id, traits).
		log('identify', { id, traits });
	},
	capture: (event: AnalyticsEvent): void => {
		if (detectPosthogMode() === 'mock') {
			log('capture', event);
			return;
		}
		log('capture', event);
	},
};
