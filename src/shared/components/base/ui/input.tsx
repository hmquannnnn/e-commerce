import * as React from 'react';

import { cn } from '@/src/shared/lib/utils';

/**
 * `search-input` per DESIGN.md §"Inputs": 44px tall, fully pill-shaped,
 * 1px hairline ring, body type at 17px. The pill matches the CTA grammar —
 * inputs read as "type a search/value" affordances.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'h-11 w-full min-w-0 rounded-full border border-hairline bg-canvas px-5 py-2',
				'text-[15px] text-ink selection:bg-primary/15 placeholder:text-ink-muted-48',
				'transition-[color,border-color,box-shadow] outline-none',
				'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
				'focus-visible:border-primary-focus focus-visible:ring-[3px] focus-visible:ring-primary-focus/30',
				'aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/25',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{...props}
		/>
	);
}

export { Input };
