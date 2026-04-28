import { describe, expect, it } from 'vitest';
import {
	ActionError,
	AppError,
	AuthError,
	BudgetError,
	IntegrationError,
	MemoryError,
	RouterError,
	ValidationError,
} from './errors';

describe('AppError', () => {
	it('captures code, message, and class name', () => {
		const err = new AppError('TEST_CODE', 'something went wrong');
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(AppError);
		expect(err.code).toBe('TEST_CODE');
		expect(err.message).toBe('something went wrong');
		expect(err.name).toBe('AppError');
	});

	it('preserves cause chain when provided', () => {
		const root = new Error('original');
		const wrapped = new AppError('WRAP', 'wrapped failure', root);
		expect(wrapped.cause).toBe(root);
	});

	it('omits cause when not provided (does not set undefined property)', () => {
		const err = new AppError('NO_CAUSE', 'plain');
		expect('cause' in err && err.cause !== undefined).toBe(false);
	});

	it('serialises to JSON without leaking the cause chain', () => {
		const err = new AppError('CODE', 'msg', new Error('secret-internal'));
		const serialised = err.toJSON();
		expect(serialised).toEqual({ name: 'AppError', code: 'CODE', message: 'msg' });
		expect(JSON.stringify(serialised)).not.toContain('secret-internal');
	});
});

describe('Typed subclasses', () => {
	const subclasses = [
		['RouterError', RouterError],
		['MemoryError', MemoryError],
		['ActionError', ActionError],
		['IntegrationError', IntegrationError],
		['AuthError', AuthError],
		['BudgetError', BudgetError],
		['ValidationError', ValidationError],
	] as const;

	for (const [name, Ctor] of subclasses) {
		it(`${name} inherits from AppError and reports its own name`, () => {
			const err = new Ctor('CODE', 'msg');
			expect(err).toBeInstanceOf(AppError);
			expect(err).toBeInstanceOf(Ctor);
			expect(err.name).toBe(name);
		});
	}

	it('subclasses are distinguishable via instanceof', () => {
		const err: AppError = new BudgetError('OVER_LIMIT', 'over');
		expect(err instanceof BudgetError).toBe(true);
		expect(err instanceof RouterError).toBe(false);
	});
});
