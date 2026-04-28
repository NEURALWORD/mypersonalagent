'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const ICONS = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} as const;

const NEXT = {
	system: 'light',
	light: 'dark',
	dark: 'system',
} as const;

type ThemeName = keyof typeof ICONS;

const isThemeName = (value: string | undefined): value is ThemeName =>
	value === 'light' || value === 'dark' || value === 'system';

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) {
		return <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled />;
	}
	const current: ThemeName = isThemeName(theme) ? theme : 'system';
	const Icon = ICONS[current];
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(NEXT[current])}
			aria-label={`Switch to ${NEXT[current]} theme`}
		>
			<Icon className="h-4 w-4" />
		</Button>
	);
};
