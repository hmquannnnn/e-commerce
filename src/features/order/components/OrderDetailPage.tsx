'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { useAppSelector } from '@/src/core/store/store';
import { ROUTES } from '@/src/shared/constants/routes';
import { formatPrice } from '@/src/shared/lib/utils';
import { useOrder, useCancelOrder, getOrderErrorCode } from '../api';
import type { OrderStatus } from '../interfaces';
import OrderLineItemRow from './OrderLineItemRow';

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

interface OrderDetailPageProps {
	orderId: string;
}

const OrderDetailPage = ({ orderId }: OrderDetailPageProps) => {
	const t = useTranslations();
	const locale = useLocale();
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const { data: order, isLoading, isError, refetch } = useOrder(orderId);
	const cancelOrder = useCancelOrder();

	const canCancel = order && (order.status === 'PENDING' || order.status === 'PAID');

	const handleCancel = () => {
		if (!window.confirm(t('order.cancel_confirm'))) return;
		cancelOrder.mutate(orderId, {
			onSuccess: () => {
				toast.success(t('order.cancel_success'));
				refetch();
			},
			onError: (err) => {
				const code = getOrderErrorCode(err);
				if (code === 'ORDER_NOT_CANCELLABLE') toast.error(t('order.error_not_cancellable'));
				else toast.error(t('order.cancel_error'));
			},
		});
	};

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-muted-foreground h-14 w-14" />
				<p className="text-muted-foreground">{t('order.detail_login_required')}</p>
				<Button asChild>
					<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-32 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-destructive h-14 w-14" />
				<p className="text-muted-foreground">{t('order.detail_not_found')}</p>
				<Button variant="outline" asChild>
					<Link href={`/${locale}${ROUTES.ORDERS.LIST}`}>{t('order.back_to_list')}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<Link
				href={`/${locale}${ROUTES.ORDERS.LIST}`}
				className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				{t('order.back_to_list')}
			</Link>

			<div className="bg-card rounded-xl border p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-xl font-bold">{t('order.detail_title')}</h1>
						<p className="text-muted-foreground mt-1 font-mono text-sm">{order.id}</p>
						<p className="text-muted-foreground mt-2 text-sm">
							{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
						</p>
					</div>
					<div className="flex flex-col items-end gap-2">
						<Badge variant={statusVariant(order.status)}>{t(`order.status_${order.status}`)}</Badge>
						<p className="text-sm">
							{t('order.payment_method')}:{' '}
							<span className="font-medium">
								{order.payment_method === 'CASH' ? t('order.payment_cash') : t('order.payment_vnpay')}
							</span>
						</p>
						<p className="text-primary text-lg font-bold">{formatPrice(order.total_price)}</p>
					</div>
				</div>

				{canCancel && (
					<>
						<Separator className="my-6" />
						<Button variant="destructive" onClick={handleCancel} disabled={cancelOrder.isPending}>
							{cancelOrder.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t('order.cancelling')}
								</>
							) : (
								t('order.cancel_order')
							)}
						</Button>
					</>
				)}
			</div>

			<div>
				<h2 className="mb-4 text-lg font-semibold">{t('order.items')}</h2>
				<div className="space-y-3">
					{order.items.map((item) => (
						<OrderLineItemRow key={`${item.product_id}-${item.product_name}`} item={item} />
					))}
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
