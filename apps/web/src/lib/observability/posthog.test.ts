import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectPosthogMode, ph } from './posthog';

beforeEach(() => {
	vi.stubEnv('NODE_ENV', 'development');
});
afterEach(() => {
	vi.unstubAllEnvs();
});

describe('detectPosthogMode', () => {
	it('returns mock when keys are missing', () => {
		expect(detectPosthogMode({})).toBe('mock');
	});

	it('returns real only when both keys are present', () => {
		expect(
			detectPosthogMode({
				NEXT_PUBLIC_POSTHOG_KEY: 'phc_x',
				NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.posthog.com',
			}),
		).toBe('real');
	});
});

describe('ph.identify', () => {
	it('hashes the user id in non-production', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			ph.identify('usr_real_clerk_id_xyz', { plan: 'pro' });
			const calls = spy.mock.calls.flat();
			const seen = JSON.stringify(calls);
			expect(seen).not.toContain('usr_real_clerk_id_xyz');
			expect(seen).toMatch(/u_[0-9a-f]+/);
		} finally {
			spy.mockRestore();
		}
	});

	it('hashes deterministically (same input -> same hash)', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			ph.identify('usr_real_clerk_id_xyz');
			ph.identify('usr_real_clerk_id_xyz');
			const first = JSON.stringify(spy.mock.calls[0]);
			const second = JSON.stringify(spy.mock.calls[1]);
			const idA = first.match(/u_[0-9a-f]+/)?.[0];
			const idB = second.match(/u_[0-9a-f]+/)?.[0];
			expect(idA).toBeDefined();
			expect(idA).toBe(idB);
		} finally {
			spy.mockRestore();
		}
	});

	it('passes raw user id in production', () => {
		vi.stubEnv('NODE_ENV', 'production');
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			ph.identify('usr_prod_id');
			const seen = JSON.stringify(spy.mock.calls.flat());
			expect(seen).toContain('usr_prod_id');
		} finally {
			spy.mockRestore();
		}
	});
});

describe('ph.capture', () => {
	it('emits a captured event via the mock logger', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			ph.capture({ name: 'memory.created', properties: { source: 'email' } });
			const seen = JSON.stringify(spy.mock.calls.flat());
			expect(seen).toContain('memory.created');
			expect(seen).toContain('source');
		} finally {
			spy.mockRestore();
		}
	});
});
