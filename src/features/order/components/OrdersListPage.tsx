'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, ChevronLeft, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { useAppSelector } from '@/src/core/store/store';
import { ROUTES } from '@/src/shared/constants/routes';
import { formatPrice } from '@/src/shared/lib/utils';
import { useOrders } from '../api';
import type { OrderStatus } from '../interfaces';

const statusVariant = (status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'CANCELLED':
			return 'destructive';
		case 'PAID':
		case 'PROCESSING':
			return 'default';
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
				<AlertCircle className="text-muted-foreground h-14 w-14" />
				<p className="text-muted-foreground">{t('order.list_login_required')}</p>
				<Button asChild>
					<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-40" />
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-20 w-full rounded-xl" />
				))}
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-destructive h-14 w-14" />
				<p className="text-muted-foreground">{t('order.load_error')}</p>
				<Button variant="outline" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	const shortId = (id: string) => id.slice(0, 8);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Package className="h-6 w-6" />
				<h1 className="text-2xl font-bold">{t('order.list_title')}</h1>
			</div>

			{data.items.length === 0 ? (
				<p className="text-muted-foreground py-12 text-center">{t('order.list_empty')}</p>
			) : (
				<>
					<ul className="space-y-3">
						{data.items.map((order) => (
							<li key={order.id}>
								<Link
									href={`/${locale}${ROUTES.ORDERS.DETAIL(order.id)}`}
									className="bg-card hover:bg-muted/50 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
								>
									<div>
										<p className="font-mono text-sm font-medium">#{shortId(order.id)}</p>
										<p className="text-muted-foreground text-xs">
											{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
										</p>
									</div>
									<div className="flex flex-wrap items-center gap-3">
										<Badge variant={statusVariant(order.status)}>{t(`order.status_${order.status}`)}</Badge>
										<span className="text-primary font-semibold">{formatPrice(order.total_price)}</span>
									</div>
								</Link>
							</li>
						))}
					</ul>

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
			)}
		</div>
	);
};

export default OrdersListPage;
