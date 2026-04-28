'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { detectClientAuthMode } from '@/lib/auth/types';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * In real mode, wraps children in <ClerkProvider/> with the publishable key.
 * In mock mode (no Clerk env), renders children directly so the app boots
 * fully without Clerk credentials. See ADR-020.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const mode = detectClientAuthMode(PUBLISHABLE_KEY);
	if (mode === 'mock') {
		return <>{children}</>;
	}
	return <ClerkProvider>{children}</ClerkProvider>;
};
