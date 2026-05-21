import * as React from 'react';

import { cn } from '@/src/shared/lib/utils';

/**
 * `store-utility-card` per DESIGN.md §"Cards & Containers".
 *
 * 18px corners, 1px hairline border, NO drop-shadow.
 * Apple's only drop-shadow is reserved for product photography (use the
 * `shadow-product` utility from globals.scss on the product image, not the
 * card surface). Use the `surface` prop to drop the chrome on full-bleed
 * tile sections (e.g. dark product tiles).
 */
function Card({
	className,
	surface = 'card',
	...props
}: React.ComponentProps<'div'> & { surface?: 'card' | 'flat' | 'parchment' | 'dark' }) {
	const surfaceClass = {
		card: 'bg-canvas border border-hairline',
		flat: 'bg-transparent border-0',
		parchment: 'bg-canvas-parchment border-0',
		dark: 'bg-surface-tile-1 text-body-on-dark border-0',
	}[surface];

	return (
		<div
			data-slot="card"
			data-surface={surface}
			className={cn('flex flex-col gap-6 rounded-[18px] py-6 text-card-foreground', surfaceClass, className)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
				className
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-title"
			className={cn('font-display text-[17px] leading-[1.24] font-semibold tracking-[-0.022em]', className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-[14px] leading-[1.43] tracking-[-0.014em] text-ink-muted-48', className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div data-slot="card-footer" className={cn('flex items-center px-6 [.border-t]:pt-6', className)} {...props} />
	);
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
