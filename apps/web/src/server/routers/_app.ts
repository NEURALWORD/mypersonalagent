import { router } from '../trpc';
import { actionsRouter } from './actions';
import { authRouter } from './auth';
import { chatRouter } from './chat';
import { integrationsRouter } from './integrations';
import { memoryRouter } from './memory';
import { settingsRouter } from './settings';

export const appRouter = router({
	auth: authRouter,
	chat: chatRouter,
	memory: memoryRouter,
	actions: actionsRouter,
	integrations: integrationsRouter,
	settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
