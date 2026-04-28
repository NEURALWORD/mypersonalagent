import { Calendar, Inbox, MessageSquare, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const NAV: Array<{ href: string; label: string; icon: typeof MessageSquare }> = [
	{ href: '/app/chat', label: 'Chat', icon: MessageSquare },
	{ href: '/app/inbox', label: 'Inbox', icon: Inbox },
	{ href: '/app/calendar', label: 'Calendar', icon: Calendar },
	{ href: '/app/people', label: 'People', icon: Users },
	{ href: '/app/settings', label: 'Settings', icon: Settings },
];

type SidebarProps = {
	currentPath?: string;
};

export const Sidebar = ({ currentPath }: SidebarProps) => (
	<aside className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] py-6">
		<div className="px-6 pb-6 text-sm font-semibold tracking-tight">Executive Agent</div>
		<nav className="flex flex-col gap-1 px-3">
			{NAV.map(({ href, label, icon: Icon }) => {
				const active = currentPath === href || currentPath?.startsWith(`${href}/`);
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
							active
								? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]'
								: 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]',
						)}
					>
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</Link>
				);
			})}
		</nav>
	</aside>
);
