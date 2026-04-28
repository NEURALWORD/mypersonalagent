export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

export class UnwrapError extends Error {
	public override readonly cause: unknown;
	constructor(cause: unknown) {
		super('Called unwrap on an Err Result');
		this.name = 'UnwrapError';
		this.cause = cause;
	}
}

export const unwrap = <T, E>(r: Result<T, E>): T => {
	if (r.ok) return r.value;
	throw new UnwrapError(r.error);
};

export const unwrapOr = <T, E>(r: Result<T, E>, fallback: T): T => (r.ok ? r.value : fallback);

export const map = <T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
	r.ok ? ok(fn(r.value)) : r;

export const mapErr = <T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> =>
	r.ok ? r : err(fn(r.error));
