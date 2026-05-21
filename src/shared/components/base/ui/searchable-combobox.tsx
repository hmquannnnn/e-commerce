'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { cn } from '@/src/shared/lib/utils';

export interface ISearchableComboboxItem {
	value: string;
	label: string;
	/** Optional searchable text (defaults to `label`). Pre-normalized strings give faster filtering. */
	searchText?: string;
}

interface ISearchableComboboxProps {
	items: ISearchableComboboxItem[];
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	searchPlaceholder: string;
	emptyText: string;
	loadingText?: string;
	disabledHint?: string;
	disabled?: boolean;
	isLoading?: boolean;
	className?: string;
}

/**
 * Removes Vietnamese diacritics and lowercases so search is dấu-insensitive.
 * "Hà Nội" + query "ha noi" → match.
 */
const normalize = (s: string): string =>
	s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.toLowerCase()
		.trim();

export const SearchableCombobox = ({
	items,
	value,
	onChange,
	placeholder,
	searchPlaceholder,
	emptyText,
	loadingText,
	disabledHint,
	disabled = false,
	isLoading = false,
	className,
}: ISearchableComboboxProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setQuery('');
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			const id = requestAnimationFrame(() => inputRef.current?.focus());
			return () => cancelAnimationFrame(id);
		}
	}, [isOpen]);

	const selected = useMemo(() => items.find((i) => i.value === value), [items, value]);

	const filtered = useMemo(() => {
		const q = normalize(query);
		if (!q) return items;
		return items.filter((item) => normalize(item.searchText ?? item.label).includes(q));
	}, [items, query]);

	const triggerLabel = (() => {
		if (selected) return selected.label;
		if (disabled && disabledHint) return disabledHint;
		return placeholder;
	})();

	const handleSelect = (next: string) => {
		onChange(next);
		setIsOpen(false);
		setQuery('');
	};

	return (
		<div ref={wrapperRef} className={cn('relative w-full', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					'disabled:cursor-not-allowed disabled:opacity-50',
					!selected && 'text-muted-foreground'
				)}
			>
				<span className="line-clamp-1 text-left">{triggerLabel}</span>
				<ChevronDown
					className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', isOpen && 'rotate-180')}
				/>
			</button>

			{isOpen && (
				<div className="bg-popover text-popover-foreground absolute left-0 right-0 top-full z-50 mt-1 flex max-h-72 flex-col overflow-hidden rounded-md border shadow-md">
					<div className="border-b p-2">
						<div className="relative">
							<Search className="text-muted-foreground absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={searchPlaceholder}
								className="border-input bg-background ring-offset-background focus-visible:ring-ring h-8 w-full rounded-md border pl-8 pr-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
							/>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto p-1">
						{(() => {
							if (isLoading) {
								return (
									<div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>{loadingText ?? '...'}</span>
									</div>
								);
							}
							if (filtered.length === 0) {
								return <div className="text-muted-foreground py-6 text-center text-sm">{emptyText}</div>;
							}
							return filtered.map((item) => {
								const isSelected = item.value === value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => handleSelect(item.value)}
										className={cn(
											'hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm',
											isSelected && 'bg-accent text-accent-foreground'
										)}
									>
										<span className="line-clamp-1 text-left">{item.label}</span>
										{isSelected && <Check className="h-4 w-4 shrink-0" />}
									</button>
								);
							});
						})()}
					</div>
				</div>
			)}
		</div>
	);
};
