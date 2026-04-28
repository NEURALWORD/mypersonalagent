import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectTracingMode, startTrace } from './index';

beforeEach(() => {
	vi.stubEnv('NODE_ENV', 'test');
});
afterEach(() => {
	vi.unstubAllEnvs();
});

describe('detectTracingMode', () => {
	it('returns mock when neither key is set', () => {
		expect(detectTracingMode({})).toBe('mock');
	});

	it('returns real only when both Langfuse keys are present', () => {
		expect(
			detectTracingMode({
				LANGFUSE_PUBLIC_KEY: 'pub',
				LANGFUSE_SECRET_KEY: 'sec',
			}),
		).toBe('real');
	});
});

describe('startTrace (mock mode)', () => {
	it('returns a Trace with a stable id and a startSpan helper', async () => {
		const trace = startTrace('email.triage', { userId: 'u1' });
		expect(trace.id).toMatch(/^trace_/);
		const span = trace.startSpan({ name: 'classify' });
		expect(span.id).toMatch(/^span_/);
		await span.end({ output: 'spam', usage: { totalTokens: 12 } });
		await trace.end({ outcome: 'success' });
	});

	it('scrubs PII before logging metadata', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			const trace = startTrace('email.draft', {
				userId: 'u1',
				access_token: 'sk-leak',
			});
			await trace.end({ content: 'private body' });
			const calls = spy.mock.calls.flat();
			const seen = JSON.stringify(calls);
			expect(seen).not.toContain('sk-leak');
			expect(seen).not.toContain('private body');
			expect(seen).toContain('REDACTED');
		} finally {
			spy.mockRestore();
		}
	});
});
