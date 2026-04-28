import { detectJobsMode, functions, inngest } from '@exec/jobs';
import { serve } from 'inngest/next';
import type { NextRequest } from 'next/server';

const handlers = serve({ client: inngest, functions });

const mockHandler = (): Response =>
	new Response(
		JSON.stringify({
			ok: true,
			mode: 'mock',
			message: 'Inngest is in mock mode (no keys configured).',
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } },
	);

const dispatch =
	(method: 'GET' | 'POST' | 'PUT') =>
	(req: NextRequest, ctx: unknown): Promise<Response> => {
		if (detectJobsMode() === 'mock') return Promise.resolve(mockHandler());
		return handlers[method](req, ctx);
	};

export const GET = dispatch('GET');
export const POST = dispatch('POST');
export const PUT = dispatch('PUT');
