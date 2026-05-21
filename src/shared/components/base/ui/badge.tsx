import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/src/shared/lib/utils';

/**
 * Badge / pill — used as status chips and category chips. The pill geometry
 * matches the brand button grammar (DESIGN.md `{rounded.pill}`). Variants are
 * intentionally muted: status colors are conveyed with low-saturation tints
 * rather than full Action Blue, so the only "click me" pill in the layout
 * is still the primary button.
 */
const badgeVariants = cva(
	[
		'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden',
		'rounded-full border px-3 py-0.5 text-[12px] font-medium tracking-[-0.01em] whitespace-nowrap',
		'transition-[color,background-color,border-color]',
		'focus-visible:ring-[3px] focus-visible:ring-primary-focus/30',
		'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
		'[&>svg]:pointer-events-none [&>svg]:size-3',
	].join(' '),
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-white [a&]:hover:bg-primary/90',
				secondary: 'border-transparent bg-canvas-parchment text-ink [a&]:hover:bg-hairline/40',
				outline: 'border-hairline bg-canvas text-ink [a&]:hover:bg-canvas-parchment',
				ghost: 'border-transparent bg-transparent text-ink-muted-80 [a&]:hover:bg-canvas-parchment',
				destructive: 'border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15',
				success: 'border-transparent bg-success/10 text-success [a&]:hover:bg-success/15',
				warning: 'border-transparent bg-warning/10 text-warning [a&]:hover:bg-warning/15',
				link: 'border-transparent bg-transparent text-primary underline-offset-4 [a&]:hover:underline',
			},
		},
		defaultVariants: {
			variant: 'secondary',
		},
	}
);

function Badge({
	className,
	variant = 'secondary',
	asChild = false,
	...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : 'span';

	return (
		<Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
