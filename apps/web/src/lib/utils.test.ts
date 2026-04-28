import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
	it('joins truthy class strings', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('drops falsy values', () => {
		expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
	});

	it('merges conflicting tailwind utilities (last one wins)', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4');
		expect(cn('text-zinc-900', 'text-indigo-600')).toBe('text-indigo-600');
	});

	it('preserves non-conflicting utilities', () => {
		const result = cn('p-2', 'text-sm', 'rounded-lg');
		expect(result.split(' ').sort()).toEqual(['p-2', 'rounded-lg', 'text-sm']);
	});

	it('handles conditional object syntax via clsx', () => {
		expect(cn('base', { active: true, hidden: false })).toBe('base active');
	});
});
