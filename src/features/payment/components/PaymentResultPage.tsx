'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/base/ui/card';
import { ROUTES } from '@/src/shared/constants/routes';
import { useAppSelector } from '@/src/core/store/store';
import { usePaymentByOrder } from '../api';
import type { PaymentStatus } from '../interfaces';
import type { LucideIcon } from 'lucide-react';

type ResultType = 'success' | 'cancel' | 'processing' | 'failed';

function getResultType(status?: PaymentStatus, forcedState?: string): ResultType {
	if (forcedState === 'success') return 'success';
	if (forcedState === 'cancel') return 'cancel';
	if (!status) return 'processing';
	if (status === 'succeeded') return 'success';
	if (status === 'canceled') return 'cancel';
	if (status === 'pending' || status === 'requires_action' || status === 'processing') return 'processing';
	return 'failed';
}

function getResultTexts(resultType: ResultType, t: ReturnType<typeof useTranslations>) {
	if (resultType === 'success') {
		return {
			title: t('order.payment_result_success'),
			description: t('order.payment_result_success_desc'),
		};
	}
	if (resultType === 'cancel') {
		return {
			title: t('order.payment_result_cancel'),
			description: t('order.payment_result_cancel_desc'),
		};
	}
	if (resultType === 'processing') {
		return {
			title: t('order.payment_result_processing'),
			description: t('order.payment_result_processing_desc'),
		};
	}
	return {
		title: t('order.payment_result_failed'),
		description: t('order.payment_result_failed_desc'),
	};
}

function getResultIcon(resultType: ResultType): { Icon: LucideIcon; className: string } {
	if (resultType === 'success') return { Icon: CheckCircle2, className: 'text-green-600 h-5 w-5' };
	if (resultType === 'cancel') return { Icon: AlertCircle, className: 'text-amber-600 h-5 w-5' };
	if (resultType === 'processing') return { Icon: Loader2, className: 'text-muted-foreground h-5 w-5 animate-spin' };
	return { Icon: XCircle, className: 'text-destructive h-5 w-5' };
}

const PaymentResultPage = () => {
	const t = useTranslations();
	const locale = useLocale();
	const searchParams = useSearchParams();
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const orderId = searchParams.get('orderId') ?? '';
	const forcedState = searchParams.get('state') ?? undefined;
	const { data, isLoading } = usePaymentByOrder(orderId);

	const resultType = useMemo(() => getResultType(data?.status, forcedState), [data?.status, forcedState]);
	const { title, description } = getResultTexts(resultType, t);
	const { Icon, className } = getResultIcon(resultType);

	if (!orderId) {
		return (
			<div className="mx-auto max-w-xl py-14">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="text-destructive h-5 w-5" />
							{t('order.payment_result_failed')}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">{t('order.payment_result_failed_desc')}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="mx-auto max-w-xl py-14">
				<Card>
					<CardHeader>
						<CardTitle>{t('order.checkout_login_required')}</CardTitle>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading && !forcedState) {
		return (
			<div className="mx-auto flex max-w-xl items-center justify-center gap-2 py-14">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span>{t('order.payment_result_processing')}</span>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-xl py-14">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Icon className={className} />
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">{description}</p>
					<div className="flex flex-wrap gap-2">
						<Button asChild>
							<Link href={`/${locale}${ROUTES.ORDERS.DETAIL(orderId)}`}>{t('order.payment_back_to_order')}</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href={`/${locale}${ROUTES.ORDERS.LIST}`}>{t('order.payment_view_orders')}</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default PaymentResultPage;
