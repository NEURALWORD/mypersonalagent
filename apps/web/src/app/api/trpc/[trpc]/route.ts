// Placeholder. F-008 wires the real tRPC fetch handler here, importing the
// AppRouter from server/routers and the trpc context. Returning 501 until then
// so the route exists for client probes but produces an unambiguous error.

const handler = () =>
	new Response('tRPC handler not yet wired (lands in F-008).', {
		status: 501,
		headers: { 'content-type': 'text/plain' },
	});

export { handler as GET, handler as POST };
