import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz';
const DEFAULT_SIZE = 21;

const baseNanoid = customAlphabet(ALPHABET, DEFAULT_SIZE);

const PREFIX_PATTERN = /^[a-z][a-z0-9_]{0,31}$/;

export const newId = (prefix: string, size: number = DEFAULT_SIZE): string => {
	if (!PREFIX_PATTERN.test(prefix)) {
		throw new Error(
			`Invalid id prefix '${prefix}': must match ${PREFIX_PATTERN.source} (1-32 chars, lowercase, starting with a letter, [a-z0-9_]).`,
		);
	}
	if (!Number.isInteger(size) || size < 8 || size > 64) {
		throw new Error(`Invalid id size ${size}: must be an integer in [8, 64].`);
	}
	const tail = size === DEFAULT_SIZE ? baseNanoid() : customAlphabet(ALPHABET, size)();
	return `${prefix}_${tail}`;
};
