import { inngest } from '../client';

/**
 * Triggered every time a new memory row lands. Phase-0 placeholder: stages
 * the consolidation candidate check that M-002/M-005 fill in.
 */
export const onMemoryCreated = inngest.createFunction(
	{
		id: 'on-memory-created',
		retries: 3,
		onFailure: async ({ event, error }) => {
			console.error('[jobs] on-memory-created dead-letter', { event, error });
		},
	},
	{ event: 'app/memory.created' },
	async ({ event, step }) => {
		const { userId, memoryId, source } = event.data;
		await step.run('check-consolidation-candidate', async () => {
			// TODO(M-005): bucket by entity, decide if a consolidation pass should fire.
			return { userId, memoryId, source };
		});
		return { processed: memoryId };
	},
);
