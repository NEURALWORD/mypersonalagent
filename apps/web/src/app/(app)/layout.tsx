import type { ReactNode } from 'react';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';

/**
 * Authenticated app shell. F-007 will swap in real Clerk middleware that
 * redirects unauthenticated requests to /sign-in. For now this layout
 * renders unconditionally so the routes are wireable end-to-end before
 * auth lands.
 */
const AppLayout = ({ children }: { children: ReactNode }) => (
	<div className="flex h-screen w-screen">
		<Sidebar />
		<div className="flex flex-1 flex-col overflow-hidden">
			<Topbar />
			<main className="flex-1 overflow-auto p-6">{children}</main>
		</div>
	</div>
);

export default AppLayout;
