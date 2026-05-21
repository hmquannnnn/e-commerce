'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Package, Phone, RefreshCw } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { useAppSelector } from '@/src/core/store/store';
import { ROUTES } from '@/src/shared/constants/routes';
import { formatPrice } from '@/src/shared/lib/utils';
import { useOrders } from '../api';
import type { OrderStatus } from '../interfaces';

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

const OrdersListPage = () => {
	const t = useTranslations();
	const locale = useLocale();
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError, refetch } = useOrders(page, limit);

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="h-14 w-14 text-ink-muted-48" />
				<p className="text-lead text-ink-muted-80">{t('order.list_login_required')}</p>
				<Button asChild>
					<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-5">
				<Skeleton className="h-10 w-48" />
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-28 w-full rounded-[18px]" />
				))}
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="h-14 w-14 text-destructive" />
				<p className="text-lead text-ink-muted-80">{t('order.load_error')}</p>
				<Button variant="outline" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	const shortId = (id: string) => id.slice(0, 8);

	return (
		<div className="space-y-10">
			<div className="space-y-2">
				<p className="text-tagline inline-flex items-center gap-2 text-primary">
					<Package className="h-4 w-4" />
					{t('order.list_title')}
				</p>
				<h1 className="text-display-lg text-ink">{t('order.list_title')}</h1>
			</div>

			{data.items.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-[18px] bg-canvas-parchment py-24">
					<Package className="h-12 w-12 text-ink-muted-48/40" />
					<p className="text-lead text-ink-muted-80">{t('order.list_empty')}</p>
				</div>
			) : (
				<>
					<ul className="space-y-4">
						{data.items.map((order) => (
							<li key={order.id}>
								<Link
									href={`/${locale}${ROUTES.ORDERS.DETAIL(order.id)}`}
									className="press flex flex-wrap items-start justify-between gap-5 rounded-[18px] border border-hairline bg-canvas p-5 transition-colors hover:border-ink-muted-48/40"
								>
									<div className="space-y-3">
										<div className="space-y-1">
											<p className="text-body-strong font-mono text-ink">#{shortId(order.id)}</p>
											<p className="text-caption text-ink-muted-48">
												{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
											</p>
										</div>
										<div className="text-caption space-y-1 text-ink-muted-48">
											<p className="flex items-center gap-1.5">
												<Phone className="h-3.5 w-3.5" />
												<span>{order.shipping_phone}</span>
											</p>
											<p className="flex items-start gap-1.5">
												<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
												<span className="line-clamp-2">{order.shipping_address}</span>
											</p>
										</div>
									</div>
									<div className="flex flex-col items-end gap-2">
										<Badge variant={statusVariant(order.status)}>{t(`order.status_${order.status}`)}</Badge>
										<span className="text-body-strong text-ink tabular-nums">{formatPrice(order.total_price)}</span>
									</div>
								</Link>
							</li>
						))}
					</ul>

					{data.total_pages > 1 && (
						<div className="flex items-center justify-center gap-4 pt-4">
							<Button
								variant="ghost"
								size="sm"
								disabled={page <= 1}
								onClick={() => setPage((p) => p - 1)}
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
								onClick={() => setPage((p) => p + 1)}
								className="gap-1"
							>
								{t('order.next_page')}
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default OrdersListPage;
