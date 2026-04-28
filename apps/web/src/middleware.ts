import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { detectAuthMode } from '@/lib/auth/types';

const isProtectedRoute = createRouteMatcher(['/app(.*)']);

const realMiddleware = clerkMiddleware(async (auth, req) => {
	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

/**
 * Edge middleware. In real mode, delegates to Clerk's clerkMiddleware which
 * enforces auth on /app/* and redirects unauthenticated requests to the
 * Clerk-hosted sign-in page. In mock mode, passes every request through
 * unchanged so dev sessions never bounce off auth.
 */
const middleware = (req: NextRequest, event: NextFetchEvent) => {
	if (detectAuthMode() === 'mock') {
		return NextResponse.next();
	}
	return realMiddleware(req, event);
};

export default middleware;

export const config = {
	matcher: ['/((?!_next|.*\\..*).*)', '/api/(.*)'],
};
