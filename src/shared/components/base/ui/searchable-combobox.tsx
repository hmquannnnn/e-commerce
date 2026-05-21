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

	// Aligned with `Input` and `SelectTrigger`: pill-shaped (rounded-full),
	// 44px tall, hairline border, 17px text, Action-Blue focus ring.
	// The popover panel mirrors `SelectContent` (rounded-[14px]).
	return (
		<div ref={wrapperRef} className={cn('relative w-full', className)}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					'press flex h-11 w-full items-center justify-between gap-2 rounded-full border border-hairline bg-canvas px-5 text-[15px] text-ink transition-[color,border-color,box-shadow] outline-none',
					'focus-visible:border-primary-focus focus-visible:ring-[3px] focus-visible:ring-primary-focus/30',
					'disabled:cursor-not-allowed disabled:opacity-50',
					!selected && 'text-ink-muted-48'
				)}
			>
				<span className="line-clamp-1 text-left">{triggerLabel}</span>
				<ChevronDown
					className={cn('h-4 w-4 shrink-0 text-ink-muted-48 opacity-80 transition-transform', isOpen && 'rotate-180')}
				/>
			</button>

			{isOpen && (
				<div className="absolute top-full right-0 left-0 z-50 mt-2 flex max-h-72 flex-col overflow-hidden rounded-[14px] border border-hairline bg-canvas text-ink">
					<div className="border-b border-hairline p-2">
						<div className="relative">
							<Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted-48" />
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={searchPlaceholder}
								className={cn(
									'h-9 w-full rounded-full border border-hairline bg-canvas pr-3 pl-10 text-[14px] text-ink transition-[color,border-color,box-shadow] outline-none placeholder:text-ink-muted-48',
									'focus-visible:border-primary-focus focus-visible:ring-[3px] focus-visible:ring-primary-focus/30'
								)}
							/>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto p-1">
						{(() => {
							if (isLoading) {
								return (
									<div className="flex items-center justify-center gap-2 py-6 text-[14px] text-ink-muted-48">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>{loadingText ?? '...'}</span>
									</div>
								);
							}
							if (filtered.length === 0) {
								return <div className="py-6 text-center text-[14px] text-ink-muted-48">{emptyText}</div>;
							}
							return filtered.map((item) => {
								const isSelected = item.value === value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => handleSelect(item.value)}
										className={cn(
											'relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-[14px] text-ink hover:bg-canvas-parchment',
											isSelected && 'bg-canvas-parchment'
										)}
									>
										<span className="line-clamp-1 text-left">{item.label}</span>
										{isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
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
