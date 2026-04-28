import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const InboxPage = () => (
	<Card>
		<CardHeader>
			<CardTitle>Inbox</CardTitle>
			<CardDescription>
				Triaged email, with one-tap drafts, snoozes, and decision-file openings.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				Wired in I-002 + AG-002. Placeholder until then.
			</p>
		</CardContent>
	</Card>
);

export default InboxPage;
