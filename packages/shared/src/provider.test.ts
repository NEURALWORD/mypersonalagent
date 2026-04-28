import { describe, expect, it, vi } from 'vitest';
import { buildProvider, mockLogger } from './provider';

describe('buildProvider', () => {
	it('returns mode=real and the real client when key is present', () => {
		const result = buildProvider({
			name: 'svc',
			key: 'sk_test_x',
			buildReal: () => ({ kind: 'real' as const }),
			buildMock: () => ({ kind: 'mock' as const }),
		});
		expect(result.mode).toBe('real');
		expect(result.client).toEqual({ kind: 'real' });
	});

	it('returns mode=mock when key is missing', () => {
		const result = buildProvider({
			name: 'svc',
			key: undefined,
			buildReal: () => ({ kind: 'real' as const }),
			buildMock: () => ({ kind: 'mock' as const }),
		});
		expect(result.mode).toBe('mock');
		expect(result.client).toEqual({ kind: 'mock' });
	});

	it('treats empty / whitespace strings as missing', () => {
		const empty = buildProvider({
			name: 'svc',
			key: '',
			buildReal: () => 'real',
			buildMock: () => 'mock',
		});
		const blank = buildProvider({
			name: 'svc',
			key: '   ',
			buildReal: () => 'real',
			buildMock: () => 'mock',
		});
		expect(empty.mode).toBe('mock');
		expect(blank.mode).toBe('mock');
	});

	it('honours an explicit mode override', () => {
		const forcedMock = buildProvider({
			name: 'svc',
			key: 'sk_real',
			buildReal: () => 'real',
			buildMock: () => 'mock',
			mode: 'mock',
		});
		expect(forcedMock.mode).toBe('mock');
		expect(forcedMock.client).toBe('mock');

		const forcedReal = buildProvider({
			name: 'svc',
			key: undefined,
			buildReal: () => 'real',
			buildMock: () => 'mock',
			mode: 'real',
		});
		expect(forcedReal.mode).toBe('real');
		expect(forcedReal.client).toBe('real');
	});

	it('only invokes the chosen builder', () => {
		const real = vi.fn(() => 'real');
		const mock = vi.fn(() => 'mock');
		buildProvider({ name: 'svc', key: 'sk', buildReal: real, buildMock: mock });
		expect(real).toHaveBeenCalledOnce();
		expect(mock).not.toHaveBeenCalled();
	});
});

describe('mockLogger', () => {
	it('is a no-op when NODE_ENV is test', () => {
		const prev = process.env.NODE_ENV;
		process.env.NODE_ENV = 'test';
		const log = mockLogger('clerk');
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			log('signin.attempt', { user: 'u_1' });
			expect(spy).not.toHaveBeenCalled();
		} finally {
			spy.mockRestore();
			process.env.NODE_ENV = prev;
		}
	});

	it('writes via console.warn in non-test environments', () => {
		const prev = process.env.NODE_ENV;
		process.env.NODE_ENV = 'development';
		const log = mockLogger('clerk');
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			log('signin.attempt', { user: 'u_1' });
			expect(spy).toHaveBeenCalledWith('[mock:clerk]', 'signin.attempt', { user: 'u_1' });
			log('plain');
			expect(spy).toHaveBeenCalledWith('[mock:clerk]', 'plain');
		} finally {
			spy.mockRestore();
			process.env.NODE_ENV = prev;
		}
	});
});
