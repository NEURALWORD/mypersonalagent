import { Webhook } from 'svix';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// We import the route lazily inside each test so env mutations land before
// module evaluation. Mocks the postgres-js client so no real DB is required.
vi.mock('@exec/db', () => ({
	createDbClient: () => ({
		db: {},
		sql: { end: async () => undefined },
	}),
	upsertUserByEmail: vi.fn(async (_db: unknown, input: { email: string }) => ({
		id: 'usr_mocked',
		email: input.email,
	})),
}));

const SECRET = 'whsec_VGVzdGluZ1Rlc3RpbmdUZXN0aW5nMTIzNDU2Nzg5MA==';

const sign = (payload: string) => {
	const wh = new Webhook(SECRET);
	const id = `msg_${Date.now()}`;
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const signature = wh.sign(id, new Date(Number(timestamp) * 1000), payload);
	return {
		'svix-id': id,
		'svix-timestamp': timestamp,
		'svix-signature': signature,
	};
};

const buildRequest = (body: string, headers: Record<string, string>) =>
	new Request('http://localhost/api/clerk/webhook', {
		method: 'POST',
		headers,
		body,
	});

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe('POST /api/clerk/webhook', () => {
	it('mock mode: returns 200 without verifying signature', async () => {
		delete process.env.CLERK_SECRET_KEY;
		delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
		const { POST } = await import('./route');
		const res = await POST(buildRequest('{}', {}));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.mode).toBe('mock');
	});

	it('real mode: rejects requests with missing svix headers', async () => {
		process.env.CLERK_SECRET_KEY = 'sk_test_x';
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_x';
		process.env.CLERK_WEBHOOK_SECRET = SECRET;
		const { POST } = await import('./route');
		const res = await POST(buildRequest('{}', {}));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toMatch(/svix/i);
	});

	it('real mode: rejects requests with an invalid signature', async () => {
		process.env.CLERK_SECRET_KEY = 'sk_test_x';
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_x';
		process.env.CLERK_WEBHOOK_SECRET = SECRET;
		const { POST } = await import('./route');
		const res = await POST(
			buildRequest('{"type":"user.created"}', {
				'svix-id': 'msg_x',
				'svix-timestamp': '1700000000',
				'svix-signature': 'v1,definitely-not-a-real-signature',
			}),
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toMatch(/Invalid signature/);
	});

	it('real mode: accepts a properly signed user.created event', async () => {
		process.env.CLERK_SECRET_KEY = 'sk_test_x';
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_x';
		process.env.CLERK_WEBHOOK_SECRET = SECRET;
		process.env.DATABASE_URL = 'postgres://dev:dev@localhost:5432/exec_agent_dev';
		const { POST } = await import('./route');
		const payload = JSON.stringify({
			type: 'user.created',
			data: {
				id: 'user_clerk_123',
				first_name: 'Manuel',
				last_name: 'Founder',
				primary_email_address_id: 'idn_1',
				email_addresses: [{ id: 'idn_1', email_address: 'm@example.com' }],
			},
		});
		const res = await POST(buildRequest(payload, sign(payload)));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.ok).toBe(true);
		expect(body.userId).toBe('usr_mocked');
	});
});
