'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	Package,
	Pencil,
	Plus,
	RefreshCw,
	Save,
	Search,
	Trash2,
} from 'lucide-react';

import { Button } from '@/src/shared/components/base/ui/button';
import { Input } from '@/src/shared/components/base/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { formatPrice } from '@/src/shared/lib/utils';
import { ROUTES } from '@/src/shared/constants/routes';
import { ICategory } from '@/src/features/product/interfaces';
import { useAdminInventory, useAdminProducts, useDeleteProduct, useUpdateStock } from '../api';
import { ADMIN_PRODUCT_QUERY_KEYS } from '../api/query-keys';
import { IAdminProduct } from '../interfaces';

const ITEMS_PER_PAGE = 20;
const ALL_CATEGORIES = '__ALL__';

interface StockCellProps {
	productId: string;
}

interface StockEditorProps {
	productId: string;
	initialStock: number;
	reservedQuantity: number;
	availableQuantity: number;
}

const StockEditor = ({ productId, initialStock, reservedQuantity, availableQuantity }: StockEditorProps) => {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const updateStock = useUpdateStock();
	const [value, setValue] = useState(String(initialStock));

	const handleSave = () => {
		const stock = Number(value);
		if (!Number.isInteger(stock) || stock < 0) {
			toast.error(t('admin.product.stock_invalid'));
			return;
		}

		updateStock.mutate(
			{ productId, request: { stock_quantity: stock } },
			{
				onSuccess: () => {
					toast.success(t('admin.product.stock_update_success'));
					queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_QUERY_KEYS.inventory(productId) });
				},
				onError: () => toast.error(t('admin.product.stock_update_error')),
			}
		);
	};

	return (
		<div className="flex min-w-[190px] flex-col gap-1">
			<div className="flex items-center gap-2">
				<Input
					type="number"
					min={0}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="h-8 w-24"
					aria-label={t('admin.product.stock')}
				/>
				<Button
					size="icon-sm"
					variant="outline"
					onClick={handleSave}
					disabled={updateStock.isPending || value === String(initialStock)}
					aria-label={t('admin.product.save_stock')}
				>
					<Save className="h-4 w-4" />
				</Button>
			</div>
			<span className="text-muted-foreground text-xs">
				{t('admin.product.stock_reserved_available', {
					reserved: reservedQuantity,
					available: availableQuantity,
				})}
			</span>
		</div>
	);
};

const StockCell = ({ productId }: StockCellProps) => {
	const t = useTranslations();
	const { data, isLoading, isError } = useAdminInventory(productId);

	if (isLoading) return <Skeleton className="h-8 w-32" />;
	if (isError || !data) return <span className="text-destructive text-xs">{t('admin.product.stock_load_error')}</span>;

	return (
		<StockEditor
			productId={productId}
			initialStock={data.stock_quantity}
			reservedQuantity={data.reserved_quantity}
			availableQuantity={data.available_quantity}
		/>
	);
};

interface ProductRowProps {
	product: IAdminProduct;
	categoryName?: string;
	locale: string;
}

const ProductRow = ({ product, categoryName, locale }: ProductRowProps) => {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const deleteProduct = useDeleteProduct();

	const handleDelete = () => {
		if (!window.confirm(t('admin.product.delete_confirm'))) return;
		deleteProduct.mutate(product.id, {
			onSuccess: () => {
				toast.success(t('admin.product.delete_success'));
				queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCT_QUERY_KEYS.all });
			},
			onError: () => toast.error(t('admin.product.delete_error')),
		});
	};

	return (
		<tr className="hover:bg-muted/30 transition-colors">
			<td className="px-4 py-3">
				<div className="max-w-[320px]">
					<p className="font-medium">{product.name}</p>
					<p className="text-muted-foreground truncate text-xs">#{product.id}</p>
				</div>
			</td>
			<td className="text-muted-foreground px-4 py-3">{categoryName ?? t('admin.product.no_category')}</td>
			<td className="text-primary px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(product.price)}</td>
			<td className="px-4 py-3">
				<StockCell productId={product.id} />
			</td>
			<td className="text-muted-foreground px-4 py-3 text-sm">
				{new Date(product.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
			</td>
			<td className="px-4 py-3">
				<div className="flex justify-end gap-2">
					<Button size="icon-sm" variant="outline" asChild aria-label={t('admin.product.edit_product')}>
						<Link href={`/${locale}${ROUTES.ADMIN.PRODUCTS.EDIT(product.id)}`}>
							<Pencil className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						size="icon-sm"
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteProduct.isPending}
						aria-label={t('admin.product.delete_product')}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</td>
		</tr>
	);
};

interface AdminProductsListPageProps {
	categories: ICategory[];
}

const AdminProductsListPage = ({ categories }: AdminProductsListPageProps) => {
	const t = useTranslations();
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
	const { data, isLoading, isError, refetch } = useAdminProducts({
		page,
		limit: ITEMS_PER_PAGE,
		search: search || undefined,
		category_id: categoryId,
	});

	const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

	const handleSearch = () => {
		setSearch(searchInput.trim());
		setPage(1);
	};

	const handleCategoryChange = (value: string) => {
		setCategoryId(value === ALL_CATEGORIES ? undefined : Number(value));
		setPage(1);
	};

	const renderTable = () => {
		if (isLoading) {
			return (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</div>
			);
		}

		if (isError || !data) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-16">
					<AlertCircle className="text-destructive h-12 w-12" />
					<p className="text-muted-foreground">{t('admin.product.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (data.items.length === 0) {
			return <p className="text-muted-foreground py-12 text-center">{t('admin.product.empty')}</p>;
		}

		return (
			<>
				<div className="overflow-x-auto rounded-xl border">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 text-left font-medium">{t('admin.product.name')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.product.category')}</th>
								<th className="px-4 py-3 text-right font-medium">{t('admin.product.price')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.product.stock')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.product.created_at')}</th>
								<th className="px-4 py-3 text-right font-medium">{t('admin.product.actions')}</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{data.items.map((product) => (
								<ProductRow
									key={product.id}
									product={product}
									categoryName={product.category_id ? categoryMap.get(product.category_id) : undefined}
									locale={locale}
								/>
							))}
						</tbody>
					</table>
				</div>

				{data.total_pages > 1 && (
					<div className="flex items-center justify-center gap-4 pt-4">
						<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
							<ChevronLeft className="h-4 w-4" />
							{t('order.prev_page')}
						</Button>
						<span className="text-muted-foreground text-sm tabular-nums">
							{t('order.page_of', { page, total: data.total_pages })}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= data.total_pages}
							onClick={() => setPage((p) => p + 1)}
						>
							{t('order.next_page')}
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Package className="h-6 w-6" />
					<h1 className="text-2xl font-bold">{t('admin.product.products')}</h1>
				</div>
				<Button asChild className="gap-2">
					<Link href={`/${locale}${ROUTES.ADMIN.PRODUCTS.NEW}`}>
						<Plus className="h-4 w-4" />
						{t('admin.product.new_product')}
					</Link>
				</Button>
			</div>

			<div className="flex flex-col gap-3 md:flex-row">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleSearch();
						}}
						placeholder={t('admin.product.search_placeholder')}
						className="pl-9"
					/>
				</div>
				<Select value={categoryId?.toString() ?? ALL_CATEGORIES} onValueChange={handleCategoryChange}>
					<SelectTrigger className="md:w-[220px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL_CATEGORIES}>{t('admin.product.all_categories')}</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id.toString()}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button onClick={handleSearch} variant="outline">
					{t('common.search')}
				</Button>
			</div>

			{renderTable()}
		</div>
	);
};

export default AdminProductsListPage;
