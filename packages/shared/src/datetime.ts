export const nowIso = (): string => new Date().toISOString();

const isValidDate = (d: Date): boolean => !Number.isNaN(d.getTime());

const ensureDate = (input: Date | string | number): Date => {
	const d = input instanceof Date ? input : new Date(input);
	if (!isValidDate(d)) throw new TypeError(`Invalid date: ${String(input)}`);
	return d;
};

const validateTimezone = (tz: string): void => {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: tz });
	} catch {
		throw new RangeError(`Invalid IANA timezone: ${tz}`);
	}
};

/**
 * Format a date in a given IANA timezone. Returns a stable
 * 'YYYY-MM-DD HH:mm:ss' string suitable for logs and rendering.
 */
export const formatInTz = (input: Date | string | number, tz: string): string => {
	validateTimezone(tz);
	const date = ensureDate(input);
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).formatToParts(date);
	const lookup: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
	for (const p of parts) lookup[p.type] = p.value;
	const hour = lookup.hour === '24' ? '00' : (lookup.hour ?? '00');
	return `${lookup.year}-${lookup.month}-${lookup.day} ${hour}:${lookup.minute}:${lookup.second}`;
};

/**
 * Returns the YYYY-MM-DD calendar date as observed in the given timezone.
 * Useful for "is today" / "same day" comparisons across users in different
 * timezones.
 */
export const toDateInTz = (input: Date | string | number, tz: string): string => {
	validateTimezone(tz);
	const date = ensureDate(input);
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
};

export const addMinutes = (input: Date | string | number, minutes: number): Date => {
	const date = ensureDate(input);
	return new Date(date.getTime() + minutes * 60_000);
};

export const diffMinutes = (a: Date | string | number, b: Date | string | number): number => {
	const aDate = ensureDate(a);
	const bDate = ensureDate(b);
	return Math.round((aDate.getTime() - bDate.getTime()) / 60_000);
};
