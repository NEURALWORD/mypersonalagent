import { createDbClient, upsertUserByEmail } from '@exec/db';
import { Webhook } from 'svix';
import { detectAuthMode } from '@/lib/auth/types';

type ClerkUserEvent = {
	type: 'user.created' | 'user.updated' | 'user.deleted';
	data: {
		id: string;
		first_name: string | null;
		last_name: string | null;
		email_addresses: Array<{ id: string; email_address: string }>;
		primary_email_address_id: string | null;
	};
};

const isClerkUserEvent = (value: unknown): value is ClerkUserEvent => {
	if (typeof value !== 'object' || value === null) return false;
	const candidate = value as { type?: unknown; data?: unknown };
	return (
		(candidate.type === 'user.created' ||
			candidate.type === 'user.updated' ||
			candidate.type === 'user.deleted') &&
		typeof candidate.data === 'object' &&
		candidate.data !== null
	);
};

const errorResponse = (status: number, message: string): Response =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'content-type': 'application/json' },
	});

export const POST = async (req: Request): Promise<Response> => {
	if (detectAuthMode() === 'mock') {
		return new Response(JSON.stringify({ ok: true, mode: 'mock' }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}

	const secret = process.env.CLERK_WEBHOOK_SECRET;
	if (!secret) {
		return errorResponse(500, 'CLERK_WEBHOOK_SECRET not configured');
	}

	const svixId = req.headers.get('svix-id');
	const svixTimestamp = req.headers.get('svix-timestamp');
	const svixSignature = req.headers.get('svix-signature');
	if (!svixId || !svixTimestamp || !svixSignature) {
		return errorResponse(400, 'Missing svix-* headers');
	}

	const body = await req.text();
	let event: unknown;
	try {
		event = new Webhook(secret).verify(body, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		});
	} catch {
		return errorResponse(400, 'Invalid signature');
	}

	if (!isClerkUserEvent(event)) {
		return errorResponse(400, 'Unsupported event type');
	}

	if (event.type === 'user.deleted') {
		// Soft-delete handling lands in M-001 once GDPR delete-user pipeline ships.
		return Response.json({ ok: true, ignored: 'user.deleted' });
	}

	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) return errorResponse(500, 'DATABASE_URL not configured');

	const primary = event.data.email_addresses.find(
		(e) => e.id === event.data.primary_email_address_id,
	);
	const email = primary?.email_address ?? event.data.email_addresses[0]?.email_address;
	if (!email) return errorResponse(400, 'No email on user payload');

	const name = [event.data.first_name, event.data.last_name].filter(Boolean).join(' ') || null;

	const { db, sql } = createDbClient(dbUrl);
	try {
		const user = await upsertUserByEmail(db, {
			clerkId: event.data.id,
			email,
			name,
		});
		return Response.json({ ok: true, userId: user?.id });
	} finally {
		await sql.end();
	}
};
