import { describe, expect, it } from 'vitest';
import {
	err,
	isErr,
	isOk,
	map,
	mapErr,
	ok,
	type Result,
	UnwrapError,
	unwrap,
	unwrapOr,
} from './result';

describe('Result', () => {
	it('ok() builds a tagged success value', () => {
		const r = ok(42);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toBe(42);
	});

	it('err() builds a tagged failure value', () => {
		const r = err('boom');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toBe('boom');
	});

	it('isOk / isErr narrow correctly', () => {
		const success: Result<number, string> = ok(1);
		const failure: Result<number, string> = err('x');
		expect(isOk(success)).toBe(true);
		expect(isErr(success)).toBe(false);
		expect(isOk(failure)).toBe(false);
		expect(isErr(failure)).toBe(true);
	});

	it('unwrap() returns value on Ok', () => {
		expect(unwrap(ok('hi'))).toBe('hi');
	});

	it('unwrap() throws UnwrapError on Err and preserves the original error', () => {
		const original = new Error('inner');
		try {
			unwrap(err(original));
			expect.fail('unwrap should have thrown');
		} catch (caught) {
			expect(caught).toBeInstanceOf(UnwrapError);
			expect((caught as UnwrapError).cause).toBe(original);
		}
	});

	it('unwrapOr() returns fallback on Err', () => {
		expect(unwrapOr(err('x'), 7)).toBe(7);
		expect(unwrapOr(ok(3), 7)).toBe(3);
	});

	it('map() transforms Ok values without touching Err', () => {
		const doubled = map(ok(2), (n) => n * 2);
		expect(doubled).toEqual({ ok: true, value: 4 });
		const passthrough = map(err<string>('x') as Result<number, string>, (n) => n * 2);
		expect(passthrough).toEqual({ ok: false, error: 'x' });
	});

	it('mapErr() transforms Err values without touching Ok', () => {
		const wrapped = mapErr(err('boom'), (e) => `wrapped: ${e}`);
		expect(wrapped).toEqual({ ok: false, error: 'wrapped: boom' });
		const passthrough = mapErr(ok(5) as Result<number, string>, (e) => `wrapped: ${e}`);
		expect(passthrough).toEqual({ ok: true, value: 5 });
	});
});
