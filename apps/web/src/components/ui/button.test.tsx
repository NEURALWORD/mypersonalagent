import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
	it('renders its children', () => {
		render(<Button>Sign in</Button>);
		expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
	});

	it('applies the variant class', () => {
		render(<Button variant="outline">Outline</Button>);
		const btn = screen.getByRole('button', { name: 'Outline' });
		expect(btn.className).toContain('border');
	});

	it('renders the primary variant by default', () => {
		render(<Button>Default</Button>);
		const btn = screen.getByRole('button', { name: 'Default' });
		expect(btn.className).toContain('color-primary');
	});

	it('forwards arbitrary props onto the underlying button', () => {
		render(
			<Button data-testid="probe" disabled>
				Disabled
			</Button>,
		);
		const btn = screen.getByTestId('probe');
		expect(btn).toBeDisabled();
	});
});
