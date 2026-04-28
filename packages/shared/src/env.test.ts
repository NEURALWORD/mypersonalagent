import { describe, expect, it } from 'vitest';
import { EnvValidationError, parseEnv } from './env';

const minimalValid: NodeJS.ProcessEnv = {
	APP_URL: 'http://localhost:3000',
	DATABASE_URL: 'postgres://dev:dev@localhost:5432/exec_agent_dev',
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_x',
	CLERK_SECRET_KEY: 'sk_test_x',
	CLERK_WEBHOOK_SECRET: 'whsec_x',
	ANTHROPIC_API_KEY: 'sk-ant-test',
	OPENAI_API_KEY: 'sk-test',
	INNGEST_EVENT_KEY: 'iek_x',
	INNGEST_SIGNING_KEY: 'isk_x',
	UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
	UPSTASH_REDIS_REST_TOKEN: 'urt_x',
	LANGFUSE_PUBLIC_KEY: 'lf_pub',
	LANGFUSE_SECRET_KEY: 'lf_sec',
	DB_COLUMN_ENCRYPTION_KEY: 'a'.repeat(64),
};

describe('parseEnv', () => {
	it('accepts a minimal valid environment and applies defaults', () => {
		const env = parseEnv(minimalValid);
		expect(env.NODE_ENV).toBe('development');
		expect(env.APP_NAME).toBe('Executive Agent');
		expect(env.LANGFUSE_HOST).toBe('https://cloud.langfuse.com');
		expect(env.DEFAULT_USER_DAILY_BUDGET_CENTS).toBe(300);
		expect(env.HARD_LIMIT_MULTIPLIER).toBeCloseTo(1.2);
	});

	it('coerces numeric and boolean strings from process.env', () => {
		const env = parseEnv({
			...minimalValid,
			DEFAULT_USER_DAILY_BUDGET_CENTS: '500',
			HARD_LIMIT_MULTIPLIER: '1.5',
			FEATURE_VOICE_ENABLED: 'true',
		});
		expect(env.DEFAULT_USER_DAILY_BUDGET_CENTS).toBe(500);
		expect(env.HARD_LIMIT_MULTIPLIER).toBeCloseTo(1.5);
		expect(env.FEATURE_VOICE_ENABLED).toBe(true);
	});

	it('throws EnvValidationError when a required var is missing', () => {
		const broken = { ...minimalValid };
		delete (broken as Record<string, unknown>).DATABASE_URL;
		expect(() => parseEnv(broken)).toThrow(EnvValidationError);
	});

	it('error message lists every failing path', () => {
		const broken: NodeJS.ProcessEnv = { ...minimalValid, APP_URL: 'not-a-url' };
		delete (broken as Record<string, unknown>).ANTHROPIC_API_KEY;
		try {
			parseEnv(broken);
			expect.fail('parseEnv should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(EnvValidationError);
			const message = (e as EnvValidationError).message;
			expect(message).toContain('APP_URL');
			expect(message).toContain('ANTHROPIC_API_KEY');
		}
	});

	it('rejects DB_COLUMN_ENCRYPTION_KEY of wrong length', () => {
		const broken = { ...minimalValid, DB_COLUMN_ENCRYPTION_KEY: 'short' };
		expect(() => parseEnv(broken)).toThrow(EnvValidationError);
	});

	it('rejects NODE_ENV outside the enum', () => {
		const broken = { ...minimalValid, NODE_ENV: 'qa' };
		expect(() => parseEnv(broken)).toThrow(EnvValidationError);
	});
});
