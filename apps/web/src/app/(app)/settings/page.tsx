import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => (
	<Card>
		<CardHeader>
			<CardTitle>Settings</CardTitle>
			<CardDescription>
				Privacy, integrations, agent personality, voice, notifications.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				Wired in UI-004. Placeholder until then.
			</p>
		</CardContent>
	</Card>
);

export default SettingsPage;
