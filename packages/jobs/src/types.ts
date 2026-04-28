/**
 * Event schema for the Inngest event channel. Add a new event here, then
 * trigger it via `inngest.send({ name, data })` and consume with
 * `inngest.createFunction({...}, { event: name }, ...)`.
 *
 * Events use the `app/<domain>.<verb>` naming convention.
 */
export type Events = {
	'app/memory.created': {
		data: {
			userId: string;
			memoryId: string;
			source: 'email' | 'calendar' | 'chat' | 'voice' | 'manual';
		};
	};
	'app/user.created': {
		data: {
			userId: string;
			email: string;
		};
	};
	'app/budget.rollover.requested': {
		data: {
			at: string;
		};
	};
};
