'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

const ErrorBoundary = ({ error, reset }: ErrorProps) => {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-4 p-12 text-center">
			<h2 className="text-lg font-semibold">Something went wrong.</h2>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				{error.message || 'An unexpected error occurred.'}
			</p>
			<Button onClick={reset} variant="outline">
				Try again
			</Button>
		</div>
	);
};

export default ErrorBoundary;
