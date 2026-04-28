import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFound = () => (
	<div className="flex h-screen flex-col items-center justify-center gap-4">
		<h2 className="text-lg font-semibold">Not found</h2>
		<p className="text-sm text-[var(--color-muted-foreground)]">
			The page you’re looking for doesn’t exist.
		</p>
		<Button asChild variant="outline">
			<Link href="/">Go home</Link>
		</Button>
	</div>
);

export default NotFound;
