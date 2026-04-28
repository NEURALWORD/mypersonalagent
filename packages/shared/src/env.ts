import { z } from 'zod';

const NodeEnv = z.enum(['development', 'staging', 'production', 'test']);
const Hex64 = z.string().regex(/^[0-9a-fA-F]{64}$/, 'must be 64 hex chars (32 bytes)');

export const envSchema = z.object({
	NODE_ENV: NodeEnv.default('development'),
	APP_URL: z.string().url(),
	APP_NAME: z.string().min(1).default('Executive Agent'),

	DATABASE_URL: z.string().url(),
	DIRECT_DATABASE_URL: z.string().url().optional(),

	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
	CLERK_SECRET_KEY: z.string().min(1),
	CLERK_WEBHOOK_SECRET: z.string().min(1),

	ANTHROPIC_API_KEY: z.string().min(1),
	OPENAI_API_KEY: z.string().min(1),

	INNGEST_EVENT_KEY: z.string().min(1),
	INNGEST_SIGNING_KEY: z.string().min(1),

	UPSTASH_REDIS_REST_URL: z.string().url(),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

	LIVEBLOCKS_SECRET_KEY: z.string().min(1).optional(),
	LIVEKIT_API_KEY: z.string().min(1).optional(),
	LIVEKIT_API_SECRET: z.string().min(1).optional(),
	LIVEKIT_URL: z.string().url().optional(),

	CARTESIA_API_KEY: z.string().min(1).optional(),
	DEEPGRAM_API_KEY: z.string().min(1).optional(),
	ELEVENLABS_API_KEY: z.string().min(1).optional(),

	R2_ACCOUNT_ID: z.string().min(1).optional(),
	R2_ACCESS_KEY_ID: z.string().min(1).optional(),
	R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
	R2_BUCKET: z.string().min(1).optional(),
	R2_PUBLIC_URL: z.string().url().optional(),

	LANGFUSE_PUBLIC_KEY: z.string().min(1),
	LANGFUSE_SECRET_KEY: z.string().min(1),
	LANGFUSE_HOST: z.string().url().default('https://cloud.langfuse.com'),
	SENTRY_DSN: z.string().url().optional(),
	SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
	NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
	NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

	STRIPE_SECRET_KEY: z.string().min(1).optional(),
	STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

	GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
	MICROSOFT_CLIENT_ID: z.string().min(1).optional(),
	MICROSOFT_CLIENT_SECRET: z.string().min(1).optional(),
	SLACK_CLIENT_ID: z.string().min(1).optional(),
	SLACK_CLIENT_SECRET: z.string().min(1).optional(),
	SLACK_SIGNING_SECRET: z.string().min(1).optional(),

	DB_COLUMN_ENCRYPTION_KEY: Hex64,
	A2A_SIGNING_PRIVATE_KEY: z.string().min(1).optional(),

	DEFAULT_USER_DAILY_BUDGET_CENTS: z.coerce.number().int().nonnegative().default(300),
	DEFAULT_USER_MONTHLY_BUDGET_CENTS: z.coerce.number().int().nonnegative().default(8000),
	HARD_LIMIT_MULTIPLIER: z.coerce.number().positive().default(1.2),

	FEATURE_VOICE_ENABLED: z.coerce.boolean().default(false),
	FEATURE_A2A_ENABLED: z.coerce.boolean().default(false),
	FEATURE_WISDOM_ENABLED: z.coerce.boolean().default(false),
	FEATURE_AUTOPILOT_EMAIL: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
	public readonly issues: z.ZodIssue[];
	constructor(issues: z.ZodIssue[]) {
		super(formatIssues(issues));
		this.name = 'EnvValidationError';
		this.issues = issues;
	}
}

const formatIssues = (issues: z.ZodIssue[]): string => {
	const lines = issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
	return `Invalid environment variables:\n${lines.join('\n')}`;
};

/**
 * Keys that are optional in dev/test (so the dev-mode mock providers from
 * ADR-020 can run) but mandatory in production. The env validator enforces
 * this so a prod boot can never silently fall back to mocks.
 */
const PRODUCTION_REQUIRED_KEYS = [
	'INNGEST_EVENT_KEY',
	'INNGEST_SIGNING_KEY',
	'LANGFUSE_PUBLIC_KEY',
	'LANGFUSE_SECRET_KEY',
	'SENTRY_DSN',
	'NEXT_PUBLIC_POSTHOG_KEY',
] as const;

/**
 * Parse and validate environment variables. Throws `EnvValidationError` with
 * a multi-line summary if anything is missing or malformed. Caller chooses
 * when to invoke (typically once at app boot) so importing this module never
 * triggers validation as a side effect.
 */
export const parseEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
	const result = envSchema.safeParse(source);
	if (!result.success) throw new EnvValidationError(result.error.issues);
	const data = result.data;
	if (data.NODE_ENV === 'production') {
		const missing: z.ZodIssue[] = [];
		for (const key of PRODUCTION_REQUIRED_KEYS) {
			const value = data[key];
			if (typeof value !== 'string' || value.trim().length === 0) {
				missing.push({
					code: 'custom',
					path: [key],
					message: 'required when NODE_ENV=production (mock fallback disabled)',
				});
			}
		}
		if (missing.length > 0) throw new EnvValidationError(missing);
	}
	return data;
};
