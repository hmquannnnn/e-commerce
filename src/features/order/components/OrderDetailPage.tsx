'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { useAppSelector } from '@/src/core/store/store';
import { ROUTES } from '@/src/shared/constants/routes';
import { formatPrice } from '@/src/shared/lib/utils';
import { useOrder, useCancelOrder, getOrderErrorCode } from '../api';
import { useCreatePayment } from '@/src/features/payment/api';
import type { OrderStatus, PaymentMethod } from '../interfaces';
import { isCancellableStatus, isPayableOnline } from '../interfaces';
import type { PaymentProvider, PaymentMethod as ProviderPaymentMethod } from '@/src/features/payment/interfaces';
import OrderLineItemRow from './OrderLineItemRow';

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

const paymentMethodLabelKey = (method: PaymentMethod): string => {
	switch (method) {
		case 'CASH':
			return 'order.payment_cash';
		case 'QR_CODE':
		default:
			return 'order.payment_qr_code';
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
	const createPayment = useCreatePayment();
	const [isRedirecting, setIsRedirecting] = useState(false);

	const canCancel = order && isCancellableStatus(order.status);
	const canRetryPayment = order && isPayableOnline(order.status, order.payment_method);

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

	// Re-initiates payment for an already-created PENDING order. Mirrors the
	// CheckoutPage flow but skips order creation: the order already exists and
	// inventory is already reserved, so we just create a fresh PaymentIntent
	// with the provider and redirect to its hosted checkout URL.
	const handleRetryPayment = () => {
		if (!order) return;
		const provider: PaymentProvider = 'payos';
		const providerPaymentMethod: ProviderPaymentMethod = 'qr_code';
		const origin = window.location.origin;
		const resultBase = `${origin}/${locale}${ROUTES.PAYMENT.RESULT}?orderId=${order.id}`;
		setIsRedirecting(true);
		createPayment.mutate(
			{
				order_id: order.id,
				provider,
				payment_method: providerPaymentMethod,
				amount: Math.round(order.total_price),
				currency: 'VND',
				return_url: `${resultBase}&state=success`,
				cancel_url: `${resultBase}&state=cancel`,
			},
			{
				onSuccess: (payment) => {
					if (!payment.checkout_url) {
						toast.error(t('order.payment_error_generic'));
						setIsRedirecting(false);
						return;
					}
					window.location.assign(payment.checkout_url);
				},
				onError: () => {
					toast.error(t('order.payment_error_generic'));
					setIsRedirecting(false);
				},
			}
		);
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
							<span className="font-medium">{t(paymentMethodLabelKey(order.payment_method))}</span>
						</p>
						<p className="text-primary text-lg font-bold">{formatPrice(order.total_price)}</p>
					</div>
				</div>

				{(canRetryPayment || canCancel) && <Separator className="my-6" />}

				{canRetryPayment && (
					<div className="bg-warning/10 mb-4 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-muted-foreground text-sm">{t('order.pay_now_hint')}</p>
						<Button onClick={handleRetryPayment} disabled={isRedirecting} className="gap-2">
							{isRedirecting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									{t('order.payment_redirect')}
								</>
							) : (
								<>
									<CreditCard className="h-4 w-4" />
									{t('order.pay_now')}
								</>
							)}
						</Button>
					</div>
				)}

				{canCancel && (
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
