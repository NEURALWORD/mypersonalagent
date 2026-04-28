import { describe, expect, it } from 'vitest';
import { scrubPii } from './scrubber';

describe('scrubPii', () => {
	it('redacts known PII fields at the top level', () => {
		expect(scrubPii({ access_token: 'sk-secret', user: 'u1' })).toEqual({
			access_token: '[REDACTED]',
			user: 'u1',
		});
	});

	it('redacts both snake_case and camelCase variants', () => {
		expect(scrubPii({ refreshToken: 'r', accessToken: 'a', password: 'p' })).toEqual({
			refreshToken: '[REDACTED]',
			accessToken: '[REDACTED]',
			password: '[REDACTED]',
		});
	});

	it('redacts message bodies and transcripts', () => {
		expect(
			scrubPii({
				email: { subject: 'hi', body: 'private letter' },
				transcript: 'sensitive call',
			}),
		).toEqual({
			email: { subject: 'hi', body: '[REDACTED]' },
			transcript: '[REDACTED]',
		});
	});

	it('walks nested arrays and objects', () => {
		expect(
			scrubPii({
				list: [
					{ id: 1, content: 'secret' },
					{ id: 2, content: 'also secret' },
				],
			}),
		).toEqual({
			list: [
				{ id: 1, content: '[REDACTED]' },
				{ id: 2, content: '[REDACTED]' },
			],
		});
	});

	it('passes primitives through unchanged', () => {
		expect(scrubPii(42)).toBe(42);
		expect(scrubPii('hello')).toBe('hello');
		expect(scrubPii(null)).toBeNull();
	});

	it('handles cycles without exploding', () => {
		const a: { self?: unknown; safe: string } = { safe: 'ok' };
		a.self = a;
		const result = scrubPii(a) as Record<string, unknown>;
		expect(result.safe).toBe('ok');
		expect(result.self).toBe('[Circular]');
	});

	it('does not mutate its input', () => {
		const original = { content: 'secret', other: 'fine' };
		scrubPii(original);
		expect(original.content).toBe('secret');
	});
});
