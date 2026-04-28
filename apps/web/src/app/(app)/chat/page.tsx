import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ChatPage = () => (
	<Card>
		<CardHeader>
			<CardTitle>Chat</CardTitle>
			<CardDescription>
				Conversational workspace. Streaming responses, tool calls visible, memory recall.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<p className="text-sm text-[var(--color-muted-foreground)]">
				Lands in UI-001. Placeholder until then.
			</p>
		</CardContent>
	</Card>
);

export default ChatPage;
