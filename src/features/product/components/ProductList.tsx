'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from '@/src/shared/components/base/ui/pagination';
import { Input } from '@/src/shared/components/base/ui/input';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { useProducts, useCategories } from '../api';
import ProductCard from './ProductCard';
import { Search, AlertCircle, RefreshCw, SlidersHorizontal, X } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const stripPriceInput = (value: string) => value.replace(/[^\d]/g, '');

const formatPriceInput = (value: string): string => {
	const digits = stripPriceInput(value);
	if (!digits) return '';

	return new Intl.NumberFormat('en-US').format(Number(digits));
};

const parseOptionalPrice = (value: string): number | null | undefined => {
	const digits = stripPriceInput(value);
	if (!digits) return undefined;

	const parsed = Number(digits);
	if (!Number.isFinite(parsed) || parsed < 0) return null;

	return parsed;
};

const ProductCardSkeleton = () => (
	<div className="flex flex-col overflow-hidden rounded-xl border">
		<Skeleton className="aspect-square w-full" />
		<div className="flex flex-col gap-2 p-4">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-2/3" />
			<Skeleton className="mt-2 h-5 w-1/2" />
		</div>
		<div className="p-4 pt-0">
			<Skeleton className="h-8 w-full" />
		</div>
	</div>
);

const getPaginationRange = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
	if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
	if (currentPage >= totalPages - 3) return [1, 'ellipsis', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
	return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

const ProductList = () => {
	const t = useTranslations();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
	const [minPriceInput, setMinPriceInput] = useState('');
	const [maxPriceInput, setMaxPriceInput] = useState('');
	const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
	const [priceError, setPriceError] = useState<string | null>(null);

	const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
	const { data, isLoading, isError, refetch } = useProducts({
		page,
		limit: ITEMS_PER_PAGE,
		search: search || undefined,
		category_id: categoryId,
		min_price: minPrice,
		max_price: maxPrice,
	});

	const categoryMap = new Map(categoriesData?.map((c) => [c.id, c.name]) ?? []);
	const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
	const hasActiveFilters = Boolean(search || categoryId !== undefined || hasPriceFilter);

	const handleSearch = useCallback(() => {
		setSearch(searchInput.trim());
		setPage(1);
	}, [searchInput]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') handleSearch();
		},
		[handleSearch]
	);

	const handleCategoryChange = (id: number | undefined) => {
		setCategoryId(id);
		setPage(1);
	};

	const handleMinPriceChange = useCallback((value: string) => {
		setMinPriceInput(formatPriceInput(value));
	}, []);

	const handleMaxPriceChange = useCallback((value: string) => {
		setMaxPriceInput(formatPriceInput(value));
	}, []);

	const handlePriceApply = useCallback(() => {
		const parsedMinPrice = parseOptionalPrice(minPriceInput);
		const parsedMaxPrice = parseOptionalPrice(maxPriceInput);

		if (parsedMinPrice === null || parsedMaxPrice === null) {
			setPriceError(t('product.list.price_invalid'));
			return;
		}

		if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
			setPriceError(t('product.list.price_range_invalid'));
			return;
		}

		setPriceError(null);
		setMinPrice(parsedMinPrice);
		setMaxPrice(parsedMaxPrice);
		setPage(1);
	}, [maxPriceInput, minPriceInput, t]);

	const handlePriceKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') handlePriceApply();
		},
		[handlePriceApply]
	);

	const handleClearFilters = useCallback(() => {
		setSearch('');
		setSearchInput('');
		setCategoryId(undefined);
		setMinPriceInput('');
		setMaxPriceInput('');
		setMinPrice(undefined);
		setMaxPrice(undefined);
		setPriceError(null);
		setPage(1);
	}, []);

	const totalPages = data?.total_pages ?? 1;
	const paginationRange = getPaginationRange(page, totalPages);

	const renderProductGrid = () => {
		if (isError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-20">
					<AlertCircle className="text-destructive h-12 w-12" />
					<p className="text-muted-foreground">{t('product.list.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (isLoading) {
			return (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			);
		}

		if (!data?.items?.length) {
			return (
				<div className="flex flex-col items-center justify-center gap-3 py-20">
					<Search className="text-muted-foreground/40 h-16 w-16" />
					<p className="text-muted-foreground font-medium">{t('product.list.no_products')}</p>
					{hasActiveFilters && (
						<Button variant="ghost" onClick={handleClearFilters}>
							{t('product.list.clear_filters')}
						</Button>
					)}
				</div>
			);
		}

		return (
			<>
				<div className="text-muted-foreground text-sm">
					{t('product.list.showing_count', { count: data.items.length, total: data.total })}
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{data.items.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							categoryName={product.category_id ? categoryMap.get(product.category_id) : undefined}
						/>
					))}
				</div>
			</>
		);
	};

	return (
		<section className="space-y-6">
			{/* Search bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder={t('product.list.search_placeholder')}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className="pl-9"
					/>
				</div>
				<Button onClick={handleSearch} variant="default">
					{t('common.search')}
				</Button>
			</div>

			{/* Price filter */}
			<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
				<div className="text-muted-foreground flex h-9 items-center gap-2 text-sm font-medium">
					<SlidersHorizontal className="h-4 w-4" />
					{t('product.list.price_filter')}
				</div>
				<div className="flex flex-1 flex-col gap-2 md:max-w-2xl">
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('product.list.min_price_placeholder')}
							value={minPriceInput}
							onChange={(e) => handleMinPriceChange(e.target.value)}
							onKeyDown={handlePriceKeyDown}
							aria-invalid={!!priceError}
							className="h-9 sm:w-40"
						/>
						<Input
							type="text"
							inputMode="numeric"
							placeholder={t('product.list.max_price_placeholder')}
							value={maxPriceInput}
							onChange={(e) => handleMaxPriceChange(e.target.value)}
							onKeyDown={handlePriceKeyDown}
							aria-invalid={!!priceError}
							className="h-9 sm:w-40"
						/>
						<div className="flex gap-2">
							<Button onClick={handlePriceApply} variant="outline" className="h-9 flex-1 gap-2 sm:flex-none">
								<SlidersHorizontal className="h-4 w-4" />
								{t('product.list.apply_filters')}
							</Button>
							{hasActiveFilters && (
								<Button
									onClick={handleClearFilters}
									variant="ghost"
									size="icon"
									className="h-9 w-9 shrink-0"
									aria-label={t('product.list.clear_filters')}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
					{priceError && <p className="text-destructive text-sm">{priceError}</p>}
				</div>
			</div>

			{/* Category filter */}
			<div className="flex flex-wrap gap-2">
				{categoriesLoading ? (
					Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)
				) : (
					<>
						<Badge
							variant={categoryId === undefined ? 'default' : 'outline'}
							className="cursor-pointer px-4 py-1.5 text-sm"
							onClick={() => handleCategoryChange(undefined)}
						>
							{t('product.list.all_categories')}
						</Badge>
						{categoriesData?.map((cat) => (
							<Badge
								key={cat.id}
								variant={categoryId === cat.id ? 'default' : 'outline'}
								className="cursor-pointer px-4 py-1.5 text-sm"
								onClick={() => handleCategoryChange(cat.id)}
							>
								{cat.name}
							</Badge>
						))}
					</>
				)}
			</div>

			{/* Product grid */}
			{renderProductGrid()}

			{/* Pagination */}
			{!isLoading && !isError && totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page > 1) setPage(page - 1);
								}}
								aria-disabled={page === 1}
								className={page === 1 ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>

						{paginationRange.map((item, idx) =>
							item === 'ellipsis' ? (
								<PaginationItem key={`ellipsis-${idx}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={item}>
									<PaginationLink
										href="#"
										isActive={item === page}
										onClick={(e) => {
											e.preventDefault();
											setPage(item);
										}}
									>
										{item}
									</PaginationLink>
								</PaginationItem>
							)
						)}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page < totalPages) setPage(page + 1);
								}}
								aria-disabled={page === totalPages}
								className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</section>
	);
};

export default ProductList;
