// Placeholder. F-009 wires Inngest's serve() handler here, importing the
// configured client and the registered functions. Returning 501 until then
// so the route exists at the canonical path the dev server probes.

const handler = () =>
	new Response('Inngest handler not yet wired (lands in F-009).', {
		status: 501,
		headers: { 'content-type': 'text/plain' },
	});

export { handler as GET, handler as POST, handler as PUT };
