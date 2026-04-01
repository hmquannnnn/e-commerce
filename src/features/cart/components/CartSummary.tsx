'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { formatPrice } from '@/src/shared/lib/utils';
import { ROUTES } from '@/src/shared/constants/routes';
import { ICart } from '../interfaces';

interface CartSummaryProps {
	cart: ICart;
}

const CartSummary = ({ cart }: CartSummaryProps) => {
	const t = useTranslations();
	const locale = useLocale();

	return (
		<div className="bg-card rounded-xl border p-6">
			<h2 className="mb-4 text-lg font-semibold">{t('cart.summary')}</h2>

			<div className="space-y-3 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t('cart.item_count', { count: cart.total_quantity })}</span>
				</div>
				<Separator />
				<div className="flex justify-between text-base font-semibold">
					<span>{t('cart.total')}</span>
					<span className="text-primary">{formatPrice(cart.total_price)}</span>
				</div>
			</div>

			<div className="mt-6 space-y-3">
				<Button className="w-full" size="lg" disabled>
					{t('cart.checkout')}
				</Button>
				<Button variant="outline" className="w-full gap-2" size="lg" asChild>
					<Link href={`/${locale}${ROUTES.HOME}`}>
						<ArrowLeft className="h-4 w-4" />
						{t('cart.continue_shopping')}
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default CartSummary;
