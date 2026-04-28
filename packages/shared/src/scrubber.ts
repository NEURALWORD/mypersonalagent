/**
 * Strips known-PII fields from arbitrary objects before they leave the
 * process toward Sentry / PostHog / logs. The wisdom layer (W-*) requires
 * separate, stronger scrubbing -- this is the lightweight everyday pass.
 */

const PII_KEYS = new Set([
	'email_body',
	'emailBody',
	'message_body',
	'messageBody',
	'body',
	'content',
	'text',
	'transcript',
	'access_token',
	'accessToken',
	'refresh_token',
	'refreshToken',
	'authorization',
	'cookie',
	'set-cookie',
	'password',
	'api_key',
	'apiKey',
	'secret',
]);

const REDACTED = '[REDACTED]';

const cloneScrubbed = (value: unknown, seen: WeakSet<object>): unknown => {
	if (value === null || typeof value !== 'object') return value;
	if (seen.has(value)) return '[Circular]';
	seen.add(value);
	if (Array.isArray(value)) {
		return value.map((v) => cloneScrubbed(v, seen));
	}
	const out: Record<string, unknown> = {};
	for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
		if (PII_KEYS.has(key) || PII_KEYS.has(key.toLowerCase())) {
			out[key] = REDACTED;
		} else {
			out[key] = cloneScrubbed(v, seen);
		}
	}
	return out;
};

export const scrubPii = <T>(input: T): T => cloneScrubbed(input, new WeakSet()) as T;
