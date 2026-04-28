import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { TrpcProvider } from '@/lib/trpc';
import './globals.css';

export const metadata: Metadata = {
	title: 'Executive Agent',
	description: 'Your AI Chief of Staff — memory-first, voice-native, predictive, privacy-first.',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
	<html lang="en" suppressHydrationWarning>
		<body>
			<AuthProvider>
				<ThemeProvider>
					<TrpcProvider>{children}</TrpcProvider>
				</ThemeProvider>
			</AuthProvider>
		</body>
	</html>
);

export default RootLayout;
