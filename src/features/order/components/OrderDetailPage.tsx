'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CreditCard, Loader2, MapPin, Phone } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
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
				<AlertCircle className="h-14 w-14 text-ink-muted-48" />
				<p className="text-lead text-ink-muted-80">{t('order.detail_login_required')}</p>
				<Button asChild>
					<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
				</Button>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-72" />
				<Skeleton className="h-44 w-full rounded-[18px]" />
				<Skeleton className="h-32 w-full rounded-[18px]" />
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="h-14 w-14 text-destructive" />
				<p className="text-lead text-ink-muted-80">{t('order.detail_not_found')}</p>
				<Button variant="outline" asChild>
					<Link href={`/${locale}${ROUTES.ORDERS.LIST}`}>{t('order.back_to_list')}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<Link
				href={`/${locale}${ROUTES.ORDERS.LIST}`}
				className="text-caption press inline-flex items-center gap-1.5 text-ink-muted-48 hover:text-ink"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				{t('order.back_to_list')}
			</Link>

			<div className="rounded-[18px] bg-canvas-parchment p-7 md:p-10">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="space-y-2">
						<p className="text-tagline text-primary">{t('order.detail_title')}</p>
						<h1 className="text-display-md font-mono text-ink">#{order.id.slice(0, 12)}</h1>
						<p className="text-caption text-ink-muted-48">
							{new Date(order.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
						</p>
					</div>
					<div className="flex flex-col items-end gap-3">
						<Badge variant={statusVariant(order.status)}>{t(`order.status_${order.status}`)}</Badge>
						<p className="text-caption text-ink-muted-48">
							{t('order.payment_method')}:{' '}
							<span className="text-caption-strong text-ink">{t(paymentMethodLabelKey(order.payment_method))}</span>
						</p>
						<p className="text-display-md text-ink tabular-nums">{formatPrice(order.total_price)}</p>
					</div>
				</div>

				<div className="mt-8 grid gap-3 border-t border-hairline pt-6 text-sm sm:grid-cols-2">
					<div className="flex items-center gap-3 rounded-[14px] border border-hairline bg-canvas p-4">
						<Phone className="h-4 w-4 text-ink-muted-48" />
						<div>
							<p className="text-caption text-ink-muted-48">{t('order.shipping_phone')}</p>
							<p className="text-body-strong text-ink">{order.shipping_phone}</p>
						</div>
					</div>
					<div className="flex items-start gap-3 rounded-[14px] border border-hairline bg-canvas p-4">
						<MapPin className="mt-0.5 h-4 w-4 text-ink-muted-48" />
						<div>
							<p className="text-caption text-ink-muted-48">{t('order.shipping_address')}</p>
							<p className="text-body-strong text-ink">{order.shipping_address}</p>
						</div>
					</div>
				</div>

				{canRetryPayment && (
					<div className="mt-6 flex flex-col gap-3 rounded-[14px] border border-hairline bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-caption text-ink-muted-80">{t('order.pay_now_hint')}</p>
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
					<div className="mt-6 flex justify-end">
						<Button variant="destructive" onClick={handleCancel} disabled={cancelOrder.isPending} className="gap-2">
							{cancelOrder.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									{t('order.cancelling')}
								</>
							) : (
								t('order.cancel_order')
							)}
						</Button>
					</div>
				)}
			</div>

			<div>
				<h2 className="text-tagline mb-5 text-ink">{t('order.items')}</h2>
				<div className="space-y-4">
					{order.items.map((item) => (
						<OrderLineItemRow key={`${item.product_id}-${item.product_name}`} item={item} />
					))}
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
