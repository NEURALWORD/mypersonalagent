import { getTableColumns, getTableName } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { integrations, privacySettings, users } from './users';

describe('users table', () => {
	it('maps to the snake_case table name', () => {
		expect(getTableName(users)).toBe('users');
	});

	it('declares the expected columns', () => {
		const cols = Object.keys(getTableColumns(users)).sort();
		expect(cols).toEqual(
			[
				'agentName',
				'agentVoiceId',
				'cohortAttributes',
				'createdAt',
				'deletedAt',
				'email',
				'id',
				'locale',
				'name',
				'preferences',
				'timezone',
			].sort(),
		);
	});

	it('uses snake_case column names in the database', () => {
		const cols = getTableColumns(users);
		expect(cols.agentName.name).toBe('agent_name');
		expect(cols.cohortAttributes.name).toBe('cohort_attributes');
		expect(cols.createdAt.name).toBe('created_at');
		expect(cols.deletedAt.name).toBe('deleted_at');
	});

	it('email is unique and not null', () => {
		const email = getTableColumns(users).email;
		expect(email.notNull).toBe(true);
		expect(email.isUnique).toBe(true);
	});
});

describe('integrations table', () => {
	it('maps to the snake_case table name', () => {
		expect(getTableName(integrations)).toBe('integrations');
	});

	it('userId is a not-null FK to users', () => {
		const col = getTableColumns(integrations).userId;
		expect(col.name).toBe('user_id');
		expect(col.notNull).toBe(true);
	});

	it('status defaults to active and accepts the documented enum values', () => {
		const col = getTableColumns(integrations).status;
		expect(col.default).toBe('active');
		expect(col.enumValues).toEqual(['active', 'expired', 'revoked']);
	});
});

describe('privacy_settings table', () => {
	it('maps to the snake_case table name', () => {
		expect(getTableName(privacySettings)).toBe('privacy_settings');
	});

	it('userId is the primary key (1:1 with users)', () => {
		const col = getTableColumns(privacySettings).userId;
		expect(col.primary).toBe(true);
	});

	it('proactiveLevel defaults to medium', () => {
		const col = getTableColumns(privacySettings).proactiveLevel;
		expect(col.default).toBe('medium');
		expect(col.enumValues).toEqual(['high', 'medium', 'low', 'off']);
	});

	it('retentionDaysRaw defaults to 90 days', () => {
		expect(getTableColumns(privacySettings).retentionDaysRaw.default).toBe(90);
	});
});
