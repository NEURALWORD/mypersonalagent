import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PeoplePage = () => (
	<Card>
		<CardHeader>
			<CardTitle>People</CardTitle>
			<CardDescription>
				Relationship health, last touch, warm-intro graph, network alerts.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				Wired in AG-004 + AG-006. Placeholder until then.
			</p>
		</CardContent>
	</Card>
);

export default PeoplePage;
