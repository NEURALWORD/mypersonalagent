import { describe, expect, it } from 'vitest';
import { newId } from './id';

describe('newId', () => {
	it('returns prefix_<21 alphanumeric chars> by default', () => {
		const id = newId('usr');
		expect(id).toMatch(/^usr_[0-9A-Za-z]{21}$/);
	});

	it('respects a custom size', () => {
		const id = newId('mem', 32);
		expect(id).toMatch(/^mem_[0-9A-Za-z]{32}$/);
	});

	it('produces unique values across many calls', () => {
		const ids = new Set<string>();
		for (let i = 0; i < 1000; i++) ids.add(newId('x'));
		expect(ids.size).toBe(1000);
	});

	it('rejects empty prefixes', () => {
		expect(() => newId('')).toThrow(/Invalid id prefix/);
	});

	it('rejects prefixes that are not lowercase ASCII', () => {
		expect(() => newId('User')).toThrow(/Invalid id prefix/);
		expect(() => newId('us-r')).toThrow(/Invalid id prefix/);
		expect(() => newId('1usr')).toThrow(/Invalid id prefix/);
	});

	it('rejects sizes outside [8, 64]', () => {
		expect(() => newId('usr', 7)).toThrow(/Invalid id size/);
		expect(() => newId('usr', 65)).toThrow(/Invalid id size/);
		expect(() => newId('usr', 16.5)).toThrow(/Invalid id size/);
	});

	it('avoids ambiguous look-alike characters (0/O/I/l/1)', () => {
		const sample = Array.from({ length: 200 }, () => newId('s', 64)).join('');
		expect(sample).not.toMatch(/[OIl]/);
	});
});
