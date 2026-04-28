import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { hashJson, hashStr } from './hash';

describe('hashStr', () => {
	it('returns a 64-char hex SHA-256 digest', () => {
		const digest = hashStr('hello');
		expect(digest).toMatch(/^[0-9a-f]{64}$/);
	});

	it('matches a reference SHA-256 digest', () => {
		const expected = createHash('sha256').update('executive-agent', 'utf8').digest('hex');
		expect(hashStr('executive-agent')).toBe(expected);
	});

	it('is stable across calls', () => {
		expect(hashStr('a')).toBe(hashStr('a'));
		expect(hashStr('a')).not.toBe(hashStr('b'));
	});
});

describe('hashJson', () => {
	it('is invariant to key order', () => {
		expect(hashJson({ a: 1, b: 2 })).toBe(hashJson({ b: 2, a: 1 }));
	});

	it('hashes nested structures deterministically', () => {
		const a = { user: { id: 'u1', tags: ['x', 'y'] }, n: 3 };
		const b = { n: 3, user: { tags: ['x', 'y'], id: 'u1' } };
		expect(hashJson(a)).toBe(hashJson(b));
	});

	it('distinguishes array order (arrays are ordered by definition)', () => {
		expect(hashJson([1, 2, 3])).not.toBe(hashJson([3, 2, 1]));
	});

	it('hashes Dates by ISO string', () => {
		const d = new Date('2026-04-28T12:00:00Z');
		expect(hashJson(d)).toBe(hashJson(d.toISOString()));
	});

	it('rejects cycles instead of stack-overflowing', () => {
		const a: { self?: unknown } = {};
		a.self = a;
		expect(() => hashJson(a)).toThrow(/cycle/);
	});

	it('rejects unsupported types (function, undefined, bigint)', () => {
		expect(() => hashJson(() => null)).toThrow();
		expect(() => hashJson(undefined)).toThrow();
		expect(() => hashJson(1n)).toThrow();
	});
});
