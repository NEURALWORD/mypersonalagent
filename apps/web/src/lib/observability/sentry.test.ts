import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureException, detectSentryMode, initSentry } from './sentry';

beforeEach(() => {
	vi.stubEnv('NODE_ENV', 'development');
});
afterEach(() => {
	vi.unstubAllEnvs();
});

describe('detectSentryMode', () => {
	it('returns mock without DSN', () => {
		expect(detectSentryMode({})).toBe('mock');
	});
	it('returns real when DSN is present', () => {
		expect(detectSentryMode({ SENTRY_DSN: 'https://x@sentry.io/1' })).toBe('real');
	});
});

describe('initSentry', () => {
	it('logs init in mock mode', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			initSentry();
			const seen = JSON.stringify(spy.mock.calls.flat());
			expect(seen).toContain('init');
			expect(seen).toContain('mock');
		} finally {
			spy.mockRestore();
		}
	});
});

describe('captureException', () => {
	it('serialises Error name and message', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			captureException(new TypeError('bad input'));
			const seen = JSON.stringify(spy.mock.calls.flat());
			expect(seen).toContain('TypeError');
			expect(seen).toContain('bad input');
		} finally {
			spy.mockRestore();
		}
	});

	it('scrubs PII from extras before logging', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			captureException(new Error('boom'), {
				userId: 'u1',
				access_token: 'sk-leak',
				request: { content: 'sensitive body' },
			});
			const seen = JSON.stringify(spy.mock.calls.flat());
			expect(seen).not.toContain('sk-leak');
			expect(seen).not.toContain('sensitive body');
			expect(seen).toContain('REDACTED');
			expect(seen).toContain('u1');
		} finally {
			spy.mockRestore();
		}
	});
});
