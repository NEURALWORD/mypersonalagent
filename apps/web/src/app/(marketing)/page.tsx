import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
	{
		title: 'Memory that compounds',
		body:
			'Every email, meeting, and decision becomes durable context — recall is instant, accurate, and auditable.',
	},
	{
		title: 'Voice always-on',
		body:
			'Sub-600ms voice loop across web, desktop, and phone. Pick up a thought from anywhere, finish it on the move.',
	},
	{
		title: 'Anticipates, never waits',
		body: 'Morning briefs, meeting prep, network nudges — surfaced before you have to ask.',
	},
] as const;

const Landing = () => (
	<div className="mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 py-24">
		<div className="space-y-6 text-center">
			<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
				Your Chief of Staff,
				<br />
				with perfect memory.
			</h1>
			<p className="max-w-2xl text-base text-[var(--color-muted-foreground)] sm:text-lg">
				An AI executive assistant for founders and CEOs. Memory-first, voice-native, predictive,
				privacy-first. On your side, always.
			</p>
			<div className="flex justify-center gap-3">
				<Button asChild>
					<Link href="/app/chat">Open the app</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="https://github.com/anthropics/claude-code/issues" target="_blank">
						Read the spec
					</Link>
				</Button>
			</div>
		</div>
		<div className="grid w-full gap-4 sm:grid-cols-3">
			{FEATURES.map((feature) => (
				<Card key={feature.title}>
					<CardHeader>
						<CardTitle>{feature.title}</CardTitle>
						<CardDescription>{feature.body}</CardDescription>
					</CardHeader>
				</Card>
			))}
		</div>
	</div>
);

export default Landing;
