'use client';

import Image from 'next/image';
import { Fragment, type FormEvent, type KeyboardEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Package, RefreshCw, Search, X } from 'lucide-react';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Button } from '@/src/shared/components/base/ui/button';
import { Input } from '@/src/shared/components/base/ui/input';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import { cn, formatPrice } from '@/src/shared/lib/utils';
import {
	ADMIN_TRANSITION_STATUSES,
	isTerminalOrderStatus,
	type IOrderCustomer,
	type IOrderItem,
	type OrderStatus,
} from '@/src/features/order/interfaces';
import { getAdminOrderErrorCode, useAdminOrder, useAdminOrders, useAdminUpdateOrderStatus } from '../api';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
const FILTER_ALL = '__ALL__';

const statusVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
	switch (status) {
		case 'CANCELLED':
			return 'destructive';
		case 'PAID':
		case 'DELIVERING':
		case 'DELIVERED':
			return 'success';
		case 'PENDING':
			return 'warning';
		default:
			return 'secondary';
	}
};

const shortId = (id: string) => id.slice(0, 8);

interface CustomerCellProps {
	userId: string;
	customer?: IOrderCustomer;
}

const CustomerCell = ({ userId, customer }: CustomerCellProps) => {
	if (!customer) {
		return (
			<div className="min-w-44" title={userId}>
				<p className="font-mono text-xs">{shortId(userId)}</p>
				<p className="text-muted-foreground text-xs">{userId}</p>
			</div>
		);
	}

	return (
		<div className="min-w-44" title={`${customer.name} - ${customer.email}`}>
			<p className="truncate font-medium">{customer.name}</p>
			<p className="text-muted-foreground truncate text-xs">{customer.email}</p>
		</div>
	);
};

interface InlineStatusUpdaterProps {
	orderId: string;
	currentStatus: OrderStatus;
}

const InlineStatusUpdater = ({ orderId, currentStatus }: InlineStatusUpdaterProps) => {
	const t = useTranslations();
	const updateStatus = useAdminUpdateOrderStatus();

	if (isTerminalOrderStatus(currentStatus)) {
		return <Badge variant={statusVariant(currentStatus)}>{t(`order.status_${currentStatus}`)}</Badge>;
	}

	const handleChange = (target: OrderStatus) => {
		if (target === currentStatus) return;
		updateStatus.mutate(
			{ orderId, status: target },
			{
				onSuccess: () => toast.success(t('admin.order.update_success')),
				onError: (err) => {
					const code = getAdminOrderErrorCode(err);
					if (code === 'INVALID_STATUS_TRANSITION') {
						toast.error(t('admin.order.update_invalid_transition'));
					} else {
						toast.error(t('admin.order.update_error'));
					}
				},
			}
		);
	};

	return (
		<div className="flex items-center gap-2">
			<Badge variant={statusVariant(currentStatus)}>{t(`order.status_${currentStatus}`)}</Badge>
			<Select
				value={currentStatus}
				onValueChange={(v) => handleChange(v as OrderStatus)}
				disabled={updateStatus.isPending}
			>
				<SelectTrigger size="sm" className="min-w-[150px]">
					<SelectValue placeholder={t('admin.order.update_status')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={currentStatus} disabled>
						{t(`order.status_${currentStatus}`)}
					</SelectItem>
					{ADMIN_TRANSITION_STATUSES.filter((s) => s !== currentStatus).map((s) => (
						<SelectItem key={s} value={s}>
							{t(`order.status_${s}`)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

interface AdminOrderItemRowProps {
	item: IOrderItem;
}

const AdminOrderItemRow = ({ item }: AdminOrderItemRowProps) => (
	<div className="grid min-w-[720px] grid-cols-[72px_minmax(220px,1fr)_80px_140px_140px] items-center gap-4 border-b px-4 py-3 last:border-b-0">
		<div className="bg-muted flex h-14 w-14 items-center justify-center overflow-hidden rounded-md">
			{item.image_url ? (
				<Image
					src={item.image_url}
					alt={item.product_name}
					width={56}
					height={56}
					className="h-full w-full object-cover"
					unoptimized
				/>
			) : (
				<Package className="text-muted-foreground/40 h-6 w-6" />
			)}
		</div>
		<div className="min-w-0">
			<p className="truncate font-medium">{item.product_name}</p>
			<p className="text-muted-foreground truncate font-mono text-xs">{item.product_id}</p>
		</div>
		<p className="text-right tabular-nums">{item.quantity}</p>
		<p className="text-right tabular-nums">{formatPrice(item.unit_price)}</p>
		<p className="text-primary text-right font-semibold tabular-nums">{formatPrice(item.subtotal)}</p>
	</div>
);

interface AdminOrderDetailPanelProps {
	orderId: string;
}

const AdminOrderDetailPanel = ({ orderId }: AdminOrderDetailPanelProps) => {
	const t = useTranslations();
	const { data: order, isLoading, isError, refetch } = useAdminOrder(orderId, true);

	if (isLoading) {
		return (
			<div className="bg-muted/20 border-t px-4 py-4">
				<div className="space-y-3">
					<Skeleton className="h-5 w-64" />
					<Skeleton className="h-20 w-full rounded-lg" />
					<Skeleton className="h-20 w-full rounded-lg" />
				</div>
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="bg-muted/20 flex items-center justify-between gap-3 border-t px-4 py-4">
				<div className="text-destructive flex items-center gap-2 text-sm">
					<AlertCircle className="h-4 w-4" />
					{t('admin.order.detail_load_error')}
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	return (
		<div className="bg-muted/20 border-t px-4 py-4">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="font-medium">{t('admin.order.detail_title')}</p>
					<p className="text-muted-foreground font-mono text-xs">{order.id}</p>
					{order.customer && (
						<p className="text-muted-foreground mt-1 text-sm">
							{order.customer.name} - {order.customer.email}
						</p>
					)}
				</div>
				<div className="text-right">
					<p className="text-muted-foreground text-xs">{t('admin.order.total')}</p>
					<p className="text-primary font-semibold tabular-nums">{formatPrice(order.total_price)}</p>
				</div>
			</div>

			<div className="bg-background overflow-x-auto rounded-lg border">
				<div className="bg-muted/50 text-muted-foreground grid min-w-[720px] grid-cols-[72px_minmax(220px,1fr)_80px_140px_140px] items-center gap-4 border-b px-4 py-2 text-xs font-medium">
					<span>{t('admin.order.product_image')}</span>
					<span>{t('admin.order.product')}</span>
					<span className="text-right">{t('admin.order.quantity')}</span>
					<span className="text-right">{t('admin.order.unit_price')}</span>
					<span className="text-right">{t('admin.order.subtotal')}</span>
				</div>
				{order.items.length > 0 ? (
					order.items.map((item) => <AdminOrderItemRow key={`${item.product_id}-${item.product_name}`} item={item} />)
				) : (
					<p className="text-muted-foreground px-4 py-6 text-center text-sm">{t('admin.order.empty_items')}</p>
				)}
			</div>
		</div>
	);
};

const AdminOrdersListPage = () => {
	const t = useTranslations();
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
	const [searchInput, setSearchInput] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(() => new Set());
	const limit = 20;
	const { data, isLoading, isError, refetch } = useAdminOrders(page, limit, statusFilter, searchTerm);

	const clearExpandedOrders = () => {
		setExpandedOrderIds(new Set());
	};

	const resetListPosition = () => {
		setPage(1);
		clearExpandedOrders();
	};

	const handleFilterChange = (value: string) => {
		resetListPosition();
		setStatusFilter(value === FILTER_ALL ? undefined : (value as OrderStatus));
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		resetListPosition();
		setSearchTerm(searchInput.trim());
	};

	const handleClearSearch = () => {
		resetListPosition();
		setSearchInput('');
		setSearchTerm('');
	};

	const toggleExpanded = (orderId: string) => {
		setExpandedOrderIds((current) => {
			const next = new Set(current);
			if (next.has(orderId)) {
				next.delete(orderId);
			} else {
				next.add(orderId);
			}
			return next;
		});
	};

	const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, orderId: string) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		toggleExpanded(orderId);
	};

	const renderBody = () => {
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
					<p className="text-muted-foreground">{t('admin.order.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (data.items.length === 0) {
			return <p className="text-muted-foreground py-12 text-center">{t('admin.order.empty')}</p>;
		}

		return (
			<>
				<div className="overflow-x-auto rounded-xl border">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-muted-foreground">
							<tr>
								<th className="w-10 px-3 py-3" aria-label={t('admin.order.expand')} />
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.id')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.customer')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.date')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.payment_method')}</th>
								<th className="px-4 py-3 text-right font-medium">{t('admin.order.total')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.status')}</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{data.items.map((order) => {
								const isExpanded = expandedOrderIds.has(order.id);

								return (
									<Fragment key={order.id}>
										<tr
											tabIndex={0}
											aria-expanded={isExpanded}
											className={cn(
												'hover:bg-muted/30 focus-visible:bg-muted/30 cursor-pointer transition-colors focus-visible:outline-none',
												isExpanded && 'bg-muted/30'
											)}
											onClick={() => toggleExpanded(order.id)}
											onKeyDown={(event) => handleRowKeyDown(event, order.id)}
										>
											<td className="px-3 py-3">
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													aria-label={isExpanded ? t('admin.order.collapse') : t('admin.order.expand')}
													onClick={(event) => {
														event.stopPropagation();
														toggleExpanded(order.id);
													}}
												>
													{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
												</Button>
											</td>
											<td className="px-4 py-3 font-mono text-xs" title={order.id}>
												#{shortId(order.id)}
											</td>
											<td className="px-4 py-3">
												<CustomerCell userId={order.user_id} customer={order.customer} />
											</td>
											<td className="text-muted-foreground px-4 py-3">
												{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
											</td>
											<td className="px-4 py-3">{order.payment_method}</td>
											<td className="text-primary px-4 py-3 text-right font-semibold tabular-nums">
												{formatPrice(order.total_price)}
											</td>
											<td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
												<InlineStatusUpdater orderId={order.id} currentStatus={order.status} />
											</td>
										</tr>
										{isExpanded && (
											<tr>
												<td colSpan={7} className="p-0">
													<AdminOrderDetailPanel orderId={order.id} />
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}
						</tbody>
					</table>
				</div>

				{data.total_pages > 1 && (
					<div className="flex items-center justify-center gap-4 pt-4">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => {
								clearExpandedOrders();
								setPage((p) => p - 1);
							}}
							className="gap-1"
						>
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
							onClick={() => {
								clearExpandedOrders();
								setPage((p) => p + 1);
							}}
							className="gap-1"
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
					<h1 className="text-2xl font-bold">{t('admin.order.orders')}</h1>
				</div>

				<div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
					<form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 sm:w-auto">
						<Input
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder={t('admin.order.search_placeholder')}
							className="w-full sm:w-80"
						/>
						<Button type="submit" variant="outline" size="sm" className="gap-2">
							<Search className="h-4 w-4" />
							{t('admin.order.search')}
						</Button>
						{searchTerm !== '' && (
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={t('admin.order.clear_search')}
								onClick={handleClearSearch}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</form>

					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">{t('admin.order.filter_status')}:</span>
						<Select value={statusFilter ?? FILTER_ALL} onValueChange={handleFilterChange}>
							<SelectTrigger size="sm" className="min-w-[160px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={FILTER_ALL}>{t('admin.order.all')}</SelectItem>
								{ALL_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{t(`order.status_${s}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{renderBody()}
		</div>
	);
};

export default AdminOrdersListPage;
