import { describe, expect, it } from 'vitest';
import { detectAuthMode, detectClientAuthMode, MOCK_USER } from './types';

describe('detectAuthMode (server)', () => {
	it('returns mock when both keys are missing', () => {
		expect(detectAuthMode({})).toBe('mock');
	});

	it('returns mock when only the publishable key is present', () => {
		expect(detectAuthMode({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x' })).toBe('mock');
	});

	it('returns mock when only the secret key is present', () => {
		expect(detectAuthMode({ CLERK_SECRET_KEY: 'sk_test_x' })).toBe('mock');
	});

	it('returns real when both keys are present', () => {
		expect(
			detectAuthMode({
				CLERK_SECRET_KEY: 'sk_test_x',
				NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
			}),
		).toBe('real');
	});

	it('treats whitespace-only keys as missing', () => {
		expect(
			detectAuthMode({
				CLERK_SECRET_KEY: '   ',
				NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '   ',
			}),
		).toBe('mock');
	});
});

describe('detectClientAuthMode (browser)', () => {
	it('returns mock when no publishable key', () => {
		expect(detectClientAuthMode(undefined)).toBe('mock');
		expect(detectClientAuthMode('')).toBe('mock');
	});

	it('returns real when publishable key is present', () => {
		expect(detectClientAuthMode('pk_test_x')).toBe('real');
	});
});

describe('MOCK_USER', () => {
	it('is a deterministic dev stub with stable id', () => {
		expect(MOCK_USER.id).toBe('usr_dev');
		expect(MOCK_USER.email).toBe('dev@local.test');
	});
});
