import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export type UserPreferences = {
	responseStyle?: 'concise' | 'detailed';
	defaultMeetingDuration?: number;
	workingHours?: { start: string; end: string };
};

export type CohortAttributes = {
	role?: string;
	stage?: string;
	teamSizeBucket?: string;
	industryBucket?: string;
	tenureBucket?: string;
};

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	timezone: text('timezone').notNull().default('UTC'),
	locale: text('locale').notNull().default('en'),
	agentName: text('agent_name').notNull().default('Atlas'),
	agentVoiceId: text('agent_voice_id'),
	preferences: jsonb('preferences').$type<UserPreferences>().notNull().default({}),
	cohortAttributes: jsonb('cohort_attributes').$type<CohortAttributes>(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type IntegrationProvider =
	| 'google'
	| 'microsoft'
	| 'slack'
	| 'linkedin'
	| 'notion'
	| 'stripe';

export type IntegrationStatus = 'active' | 'expired' | 'revoked';

export const integrations = pgTable('integrations', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	provider: text('provider').$type<IntegrationProvider>().notNull(),
	accessToken: text('access_token').notNull(),
	refreshToken: text('refresh_token'),
	expiresAt: timestamp('expires_at', { withTimezone: true }),
	scopes: jsonb('scopes').$type<string[]>().notNull().default([]),
	metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
	status: text('status', { enum: ['active', 'expired', 'revoked'] })
		.notNull()
		.default('active'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
});

export type ProactiveLevel = 'high' | 'medium' | 'low' | 'off';

export const privacySettings = pgTable('privacy_settings', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	retentionDaysRaw: integer('retention_days_raw').notNull().default(90),
	retentionDaysMemory: integer('retention_days_memory'),
	trainingOptIn: boolean('training_opt_in').notNull().default(false),
	wisdomOptIn: boolean('wisdom_opt_in').notNull().default(false),
	alwaysOnVoice: boolean('always_on_voice').notNull().default(false),
	proactiveLevel: text('proactive_level', { enum: ['high', 'medium', 'low', 'off'] })
		.notNull()
		.default('medium'),
	shareLocation: boolean('share_location').notNull().default(false),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type PrivacySetting = typeof privacySettings.$inferSelect;
export type NewPrivacySetting = typeof privacySettings.$inferInsert;
