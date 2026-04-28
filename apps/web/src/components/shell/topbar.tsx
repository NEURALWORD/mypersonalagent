import { ThemeToggle } from '@/components/theme-toggle';

type TopbarProps = {
	title?: string;
};

export const Topbar = ({ title }: TopbarProps) => (
	<header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)] px-6">
		<h1 className="text-sm font-semibold">{title ?? ''}</h1>
		<div className="flex items-center gap-2">
			<ThemeToggle />
		</div>
	</header>
);
