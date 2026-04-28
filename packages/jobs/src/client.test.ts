import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectJobsMode } from './client';

const ORIGINAL = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL };
});
afterEach(() => {
	process.env = { ...ORIGINAL };
});

describe('detectJobsMode', () => {
	it('returns mock when both Inngest keys are missing', () => {
		expect(detectJobsMode({})).toBe('mock');
	});

	it('returns mock when only the event key is present', () => {
		expect(detectJobsMode({ INNGEST_EVENT_KEY: 'evt' })).toBe('mock');
	});

	it('returns mock when only the signing key is present', () => {
		expect(detectJobsMode({ INNGEST_SIGNING_KEY: 'sig' })).toBe('mock');
	});

	it('returns real when both keys are present and non-empty', () => {
		expect(detectJobsMode({ INNGEST_EVENT_KEY: 'evt', INNGEST_SIGNING_KEY: 'sig' })).toBe('real');
	});

	it('treats whitespace-only keys as missing', () => {
		expect(detectJobsMode({ INNGEST_EVENT_KEY: '  ', INNGEST_SIGNING_KEY: '  ' })).toBe('mock');
	});
});
