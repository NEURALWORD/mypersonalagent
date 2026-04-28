import { createHash } from 'node:crypto';

export const hashStr = (input: string): string =>
	createHash('sha256').update(input, 'utf8').digest('hex');

/**
 * Stable JSON-shaped hash. Object keys are sorted recursively before hashing
 * so structurally-equivalent inputs (`{a:1,b:2}` and `{b:2,a:1}`) collapse to
 * the same digest. Primitives, arrays, null, and Dates are supported. Throws
 * on cycles, functions, undefined, symbols, or BigInt — those have no
 * cross-runtime canonical JSON form.
 */
export const hashJson = (input: unknown): string => hashStr(canonicalJson(input));

const canonicalJson = (value: unknown, seen: WeakSet<object> = new WeakSet()): string => {
	if (value === null) return 'null';
	if (typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
	if (typeof value === 'string') return JSON.stringify(value);
	if (value instanceof Date) return JSON.stringify(value.toISOString());

	if (typeof value !== 'object') {
		throw new TypeError(`hashJson: unsupported value type ${typeof value}`);
	}
	if (seen.has(value)) {
		throw new TypeError('hashJson: cycle detected');
	}
	seen.add(value);

	if (Array.isArray(value)) {
		const parts = value.map((v) => canonicalJson(v, seen));
		return `[${parts.join(',')}]`;
	}

	const obj = value as Record<string, unknown>;
	const keys = Object.keys(obj).sort();
	const parts = keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k], seen)}`);
	return `{${parts.join(',')}}`;
};
