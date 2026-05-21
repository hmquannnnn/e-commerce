import * as React from 'react';

import { cn } from '@/src/shared/lib/utils';

/**
 * Multi-line counterpart to `Input`.
 *
 * Pill shapes only fit single-line fields, so textareas use the next radius
 * down on the Apple scale (`14px` — same as dropdown panels / inline cards)
 * while keeping the hairline border, canvas surface, and Action-Blue focus
 * ring so they read as part of the same family of form controls.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex min-h-[96px] w-full rounded-[14px] border border-hairline bg-canvas px-4 py-3',
				'text-[15px] text-ink selection:bg-primary/15 placeholder:text-ink-muted-48',
				'transition-[color,border-color,box-shadow] outline-none',
				'focus-visible:border-primary-focus focus-visible:ring-[3px] focus-visible:ring-primary-focus/30',
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
				'disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{...props}
		/>
	);
}

export { Textarea };
