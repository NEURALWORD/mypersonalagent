import { describe, expect, it } from 'vitest';
import { addMinutes, diffMinutes, formatInTz, nowIso, toDateInTz } from './datetime';

describe('nowIso', () => {
	it('returns an ISO string ending in Z', () => {
		const ts = nowIso();
		expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	});
});

describe('formatInTz', () => {
	const fixed = new Date('2026-04-28T12:00:00Z');

	it('formats UTC consistently', () => {
		expect(formatInTz(fixed, 'UTC')).toBe('2026-04-28 12:00:00');
	});

	it('shifts to a later wall-clock in Europe/Rome (UTC+2 in late April due to DST)', () => {
		expect(formatInTz(fixed, 'Europe/Rome')).toBe('2026-04-28 14:00:00');
	});

	it('shifts to an earlier wall-clock in America/Los_Angeles', () => {
		expect(formatInTz(fixed, 'America/Los_Angeles')).toBe('2026-04-28 05:00:00');
	});

	it('rejects invalid IANA zones', () => {
		expect(() => formatInTz(fixed, 'Mars/Olympus')).toThrow(/Invalid IANA timezone/);
	});

	it('rejects invalid date inputs', () => {
		expect(() => formatInTz('not-a-date', 'UTC')).toThrow(/Invalid date/);
	});
});

describe('toDateInTz', () => {
	it('returns YYYY-MM-DD in target zone', () => {
		const lateNyc = new Date('2026-04-28T03:00:00Z');
		expect(toDateInTz(lateNyc, 'America/New_York')).toBe('2026-04-27');
		expect(toDateInTz(lateNyc, 'UTC')).toBe('2026-04-28');
	});
});

describe('addMinutes', () => {
	it('shifts forward and backward without mutating input', () => {
		const start = new Date('2026-04-28T12:00:00Z');
		const startMs = start.getTime();
		expect(addMinutes(start, 90).toISOString()).toBe('2026-04-28T13:30:00.000Z');
		expect(addMinutes(start, -30).toISOString()).toBe('2026-04-28T11:30:00.000Z');
		expect(start.getTime()).toBe(startMs);
	});
});

describe('diffMinutes', () => {
	it('returns whole-minute difference', () => {
		const later = new Date('2026-04-28T12:30:00Z');
		const earlier = new Date('2026-04-28T12:00:00Z');
		expect(diffMinutes(later, earlier)).toBe(30);
		expect(diffMinutes(earlier, later)).toBe(-30);
	});
});
