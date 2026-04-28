import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const MarketingLayout = ({ children }: { children: ReactNode }) => (
	<div className="flex min-h-screen flex-col">
		<header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-6">
			<span className="text-sm font-semibold">Executive Agent</span>
			<ThemeToggle />
		</header>
		<main className="flex-1">{children}</main>
	</div>
);

export default MarketingLayout;
