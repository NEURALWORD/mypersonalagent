import { mockLogger } from '@exec/shared';
import { EventSchemas, Inngest } from 'inngest';
import type { Events } from './types';

export type JobsMode = 'real' | 'mock';

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

export const detectJobsMode = (
	env: Partial<Record<string, string | undefined>> = process.env,
): JobsMode =>
	isPresent(env.INNGEST_EVENT_KEY) && isPresent(env.INNGEST_SIGNING_KEY) ? 'real' : 'mock';

const log = mockLogger('inngest');

/**
 * Inngest client. The Inngest SDK is import-time safe when keys are missing
 * — it just no-ops sends until configured. We layer a mock-mode logger over
 * `send()` so dev sessions can see what would be emitted (ADR-020).
 */
export const buildInngest = (mode: JobsMode = detectJobsMode()) => {
	const inngest = new Inngest({
		id: 'executive-agent',
		schemas: new EventSchemas().fromRecord<Events>(),
		...(mode === 'real' && process.env.INNGEST_EVENT_KEY
			? { eventKey: process.env.INNGEST_EVENT_KEY }
			: {}),
		isDev: mode === 'mock',
	});
	if (mode === 'mock') {
		const originalSend = inngest.send.bind(inngest);
		inngest.send = (async (...args: Parameters<typeof originalSend>) => {
			log('send', args[0]);
			return originalSend(...args);
		}) as typeof inngest.send;
	}
	return inngest;
};

export const inngest = buildInngest();
