'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ChevronLeft, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Button } from '@/src/shared/components/base/ui/button';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import { formatPrice } from '@/src/shared/lib/utils';
import { ADMIN_TRANSITION_STATUSES, isTerminalOrderStatus, type OrderStatus } from '@/src/features/order/interfaces';
import { getAdminOrderErrorCode, useAdminOrders, useAdminUpdateOrderStatus } from '../api';

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

const AdminOrdersListPage = () => {
	const t = useTranslations();
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
	const limit = 20;
	const { data, isLoading, isError, refetch } = useAdminOrders(page, limit, statusFilter);

	const handleFilterChange = (value: string) => {
		setPage(1);
		setStatusFilter(value === FILTER_ALL ? undefined : (value as OrderStatus));
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
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.id')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.date')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.payment_method')}</th>
								<th className="px-4 py-3 text-right font-medium">{t('admin.order.total')}</th>
								<th className="px-4 py-3 text-left font-medium">{t('admin.order.status')}</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{data.items.map((order) => (
								<tr key={order.id} className="hover:bg-muted/30 transition-colors">
									<td className="px-4 py-3 font-mono text-xs">#{shortId(order.id)}</td>
									<td className="text-muted-foreground px-4 py-3">
										{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
									</td>
									<td className="px-4 py-3">{order.payment_method}</td>
									<td className="text-primary px-4 py-3 text-right font-semibold tabular-nums">
										{formatPrice(order.total_price)}
									</td>
									<td className="px-4 py-3">
										<InlineStatusUpdater orderId={order.id} currentStatus={order.status} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{data.total_pages > 1 && (
					<div className="flex items-center justify-center gap-4 pt-4">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage((p) => p - 1)}
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
							onClick={() => setPage((p) => p + 1)}
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

			{renderBody()}
		</div>
	);
};

export default AdminOrdersListPage;
