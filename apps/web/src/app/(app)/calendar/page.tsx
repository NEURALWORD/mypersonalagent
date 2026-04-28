import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => (
	<Card>
		<CardHeader>
			<CardTitle>Calendar</CardTitle>
			<CardDescription>
				Today, tomorrow, and the rest of the week. ROI-scored, prep-attached.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				Wired in I-004 + AG-003. Placeholder until then.
			</p>
		</CardContent>
	</Card>
);

export default CalendarPage;
