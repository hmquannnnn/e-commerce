'use client';

import Image from 'next/image';
import { Fragment, type FormEvent, type KeyboardEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
	AlertCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Package,
	Phone,
	RefreshCw,
	Search,
	X,
} from 'lucide-react';
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
				<p className="text-fine font-mono text-ink">{shortId(userId)}</p>
				<p className="text-fine text-ink-muted-48">{userId}</p>
			</div>
		);
	}

	return (
		<div className="min-w-44" title={`${customer.name} - ${customer.email}`}>
			<p className="text-body-strong truncate text-ink">{customer.name}</p>
			<p className="text-fine truncate text-ink-muted-48">{customer.email}</p>
		</div>
	);
};

interface ShippingCellProps {
	phone: string;
	address: string;
}

const ShippingCell = ({ phone, address }: ShippingCellProps) => (
	<div className="max-w-72 min-w-52 space-y-1">
		<p className="text-fine flex items-center gap-1.5">
			<Phone className="h-3.5 w-3.5 text-ink-muted-48" />
			<span className="text-ink">{phone}</span>
		</p>
		<p className="text-fine flex items-start gap-1.5 text-ink-muted-48">
			<MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
			<span className="line-clamp-2">{address}</span>
		</p>
	</div>
);

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
				<SelectTrigger size="sm" className="min-w-[150px] rounded-full border-hairline bg-canvas px-3.5 text-[13px]">
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
	<div className="grid min-w-[720px] grid-cols-[72px_minmax(220px,1fr)_80px_140px_140px] items-center gap-4 border-b border-hairline/70 px-4 py-3 last:border-b-0">
		<div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[11px] bg-canvas-parchment">
			{item.image_url ? (
				<Image
					src={item.image_url}
					alt={item.product_name}
					width={56}
					height={56}
					className="shadow-product h-full w-full object-contain"
					unoptimized
				/>
			) : (
				<Package className="h-6 w-6 text-ink-muted-48/40" />
			)}
		</div>
		<div className="min-w-0">
			<p className="text-body-strong truncate text-ink">{item.product_name}</p>
			<p className="text-fine truncate font-mono text-ink-muted-48">{item.product_id}</p>
		</div>
		<p className="text-caption text-right text-ink tabular-nums">{item.quantity}</p>
		<p className="text-caption text-right text-ink-muted-80 tabular-nums">{formatPrice(item.unit_price)}</p>
		<p className="text-body-strong text-right text-ink tabular-nums">{formatPrice(item.subtotal)}</p>
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
			<div className="border-t border-hairline bg-canvas-parchment/60 px-5 py-5">
				<div className="space-y-3">
					<Skeleton className="h-5 w-64" />
					<Skeleton className="h-20 w-full rounded-[14px]" />
					<Skeleton className="h-20 w-full rounded-[14px]" />
				</div>
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="flex items-center justify-between gap-3 border-t border-hairline bg-canvas-parchment/60 px-5 py-5">
				<div className="text-caption flex items-center gap-2 text-destructive">
					<AlertCircle className="h-4 w-4" />
					{t('admin.order.detail_load_error')}
				</div>
				<Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	return (
		<div className="border-t border-hairline bg-canvas-parchment/60 px-5 py-5">
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1">
					<p className="text-body-strong text-ink">{t('admin.order.detail_title')}</p>
					<p className="text-fine font-mono text-ink-muted-48">{order.id}</p>
					{order.customer && (
						<p className="text-caption mt-1 text-ink-muted-80">
							{order.customer.name} · {order.customer.email}
						</p>
					)}
					<div className="mt-3">
						<ShippingCell phone={order.shipping_phone} address={order.shipping_address} />
					</div>
				</div>
				<div className="text-right">
					<p className="text-fine text-ink-muted-48">{t('admin.order.total')}</p>
					<p className="text-body-strong text-ink tabular-nums">{formatPrice(order.total_price)}</p>
				</div>
			</div>

			<div className="overflow-x-auto rounded-[14px] border border-hairline bg-canvas">
				<div className="text-caption-strong grid min-w-[720px] grid-cols-[72px_minmax(220px,1fr)_80px_140px_140px] items-center gap-4 border-b border-hairline bg-canvas-parchment px-4 py-2.5 text-ink-muted-80">
					<span>{t('admin.order.product_image')}</span>
					<span>{t('admin.order.product')}</span>
					<span className="text-right">{t('admin.order.quantity')}</span>
					<span className="text-right">{t('admin.order.unit_price')}</span>
					<span className="text-right">{t('admin.order.subtotal')}</span>
				</div>
				{order.items.length > 0 ? (
					order.items.map((item) => <AdminOrderItemRow key={`${item.product_id}-${item.product_name}`} item={item} />)
				) : (
					<p className="text-caption px-4 py-6 text-center text-ink-muted-48">{t('admin.order.empty_items')}</p>
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
						<Skeleton key={i} className="h-16 w-full rounded-[14px]" />
					))}
				</div>
			);
		}

		if (isError || !data) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-16">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<p className="text-lead text-ink-muted-80">{t('admin.order.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (data.items.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center gap-3 rounded-[18px] bg-canvas-parchment py-20">
					<Package className="h-12 w-12 text-ink-muted-48/40" />
					<p className="text-lead text-ink-muted-80">{t('admin.order.empty')}</p>
				</div>
			);
		}

		return (
			<>
				<div className="overflow-x-auto rounded-[18px] border border-hairline">
					<table className="w-full text-sm">
						<thead className="text-caption-strong bg-canvas-parchment text-ink-muted-80">
							<tr>
								<th className="w-10 px-3 py-3" aria-label={t('admin.order.expand')} />
								<th className="px-4 py-3 text-left">{t('admin.order.id')}</th>
								<th className="px-4 py-3 text-left">{t('admin.order.customer')}</th>
								<th className="px-4 py-3 text-left">{t('admin.order.shipping')}</th>
								<th className="px-4 py-3 text-left">{t('admin.order.date')}</th>
								<th className="px-4 py-3 text-left">{t('admin.order.payment_method')}</th>
								<th className="px-4 py-3 text-right">{t('admin.order.total')}</th>
								<th className="px-4 py-3 text-left">{t('admin.order.status')}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-hairline">
							{data.items.map((order) => {
								const isExpanded = expandedOrderIds.has(order.id);

								return (
									<Fragment key={order.id}>
										<tr
											tabIndex={0}
											aria-expanded={isExpanded}
											className={cn(
												'cursor-pointer transition-colors hover:bg-canvas-parchment/40 focus-visible:bg-canvas-parchment/40 focus-visible:outline-none',
												isExpanded && 'bg-canvas-parchment/40'
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
											<td className="text-fine px-4 py-3 font-mono text-ink" title={order.id}>
												#{shortId(order.id)}
											</td>
											<td className="px-4 py-3">
												<CustomerCell userId={order.user_id} customer={order.customer} />
											</td>
											<td className="px-4 py-3">
												<ShippingCell phone={order.shipping_phone} address={order.shipping_address} />
											</td>
											<td className="text-caption px-4 py-3 text-ink-muted-48">
												{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
											</td>
											<td className="text-caption px-4 py-3 text-ink">{order.payment_method}</td>
											<td className="text-body-strong px-4 py-3 text-right text-ink tabular-nums">
												{formatPrice(order.total_price)}
											</td>
											<td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
												<InlineStatusUpdater orderId={order.id} currentStatus={order.status} />
											</td>
										</tr>
										{isExpanded && (
											<tr>
												<td colSpan={8} className="p-0">
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
							variant="ghost"
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
						<span className="text-caption text-ink-muted-48 tabular-nums">
							{t('order.page_of', { page, total: data.total_pages })}
						</span>
						<Button
							variant="ghost"
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
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<p className="text-tagline text-primary">{t('admin.order.orders')}</p>
					<h1 className="text-display-lg text-ink">{t('admin.order.orders')}</h1>
				</div>

				<div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
					<form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 sm:w-auto">
						<div className="relative flex-1 sm:w-80">
							<Search className="absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-ink-muted-48" />
							<Input
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
								placeholder={t('admin.order.search_placeholder')}
								className="pl-12"
							/>
						</div>
						<Button type="submit" variant="default" size="default">
							{t('admin.order.search')}
						</Button>
						{searchTerm !== '' && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={t('admin.order.clear_search')}
								onClick={handleClearSearch}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</form>

					<div className="flex items-center gap-2">
						<span className="text-caption text-ink-muted-80">{t('admin.order.filter_status')}</span>
						<Select value={statusFilter ?? FILTER_ALL} onValueChange={handleFilterChange}>
							<SelectTrigger className="h-11 min-w-[170px] rounded-full border-hairline bg-canvas px-5">
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
