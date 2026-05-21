import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/src/shared/lib/utils';

/**
 * Button variants follow DESIGN.md §"Buttons".
 *
 *  - `default` (primary)  → Action Blue pill, the brand's "click me" signal.
 *  - `outline`            → Ghost pill in Action Blue (paired w/ primary).
 *  - `secondary`          → Pearl capsule (white pill on parchment surfaces).
 *  - `dark`               → Compact near-black utility rect (8px radius).
 *  - `destructive`        → Red pill, used very sparingly (cancel order).
 *  - `success` / `warning`→ Status pills, also sparingly.
 *  - `ghost` / `link`     → Bare text affordance.
 *  - `icon-circle`        → 44×44 translucent circular control (over imagery).
 *
 * Active state is a system-wide `transform: scale(0.96)` micro-interaction
 * (the `press` utility class declared in globals.scss).
 */
const buttonVariants = cva(
	[
		'press cursor-pointer inline-flex shrink-0 items-center justify-center gap-2',
		'whitespace-nowrap font-normal tracking-[-0.012em]',
		'outline-none focus-visible:ring-[3px] focus-visible:ring-primary-focus/50 focus-visible:ring-offset-0',
		'disabled:pointer-events-none disabled:opacity-50',
		'aria-invalid:ring-destructive/30',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	].join(' '),
	{
		variants: {
			variant: {
				default: 'bg-primary text-white hover:bg-primary/95 rounded-full',
				outline: 'bg-transparent text-primary border border-primary/70 hover:bg-primary/5 rounded-full',
				secondary:
					'bg-surface-pearl text-ink-muted-80 border border-divider-soft hover:bg-canvas hover:border-hairline rounded-md',
				dark: 'bg-ink text-white hover:bg-ink/90 rounded-[8px]',
				destructive: 'bg-destructive text-white hover:bg-destructive/90 rounded-full',
				success: 'bg-success text-success-foreground hover:bg-success/90 rounded-full',
				warning: 'bg-warning text-warning-foreground hover:bg-warning/90 rounded-full',
				ghost: 'bg-transparent text-ink hover:bg-canvas-parchment rounded-full',
				link: 'bg-transparent text-primary underline-offset-4 hover:underline rounded-none px-0',
				'icon-circle':
					'bg-[color:var(--surface-chip-translucent)] text-ink hover:bg-[color:var(--surface-chip-translucent)]/80 rounded-full backdrop-blur-md',
			},
			size: {
				default: 'h-11 px-[22px] text-[15px]',
				sm: 'h-9 px-4 text-[14px]',
				xs: 'h-8 px-3 text-[13px]',
				lg: 'h-12 px-7 text-[17px]',
				xl: 'h-14 px-8 text-[18px] font-light',
				icon: 'size-11',
				'icon-sm': 'size-9',
				'icon-xs': 'size-8',
				'icon-lg': 'size-12',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
