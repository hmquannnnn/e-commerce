'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { formatPrice } from '@/src/shared/lib/utils';
import { ROUTES } from '@/src/shared/constants/routes';
import Link from 'next/link';

interface CartSummaryProps {
	selectedCount: number;
	selectedSubtotal: number;
	canCheckout: boolean;
	onCheckout: () => void;
}

const CartSummary = ({ selectedCount, selectedSubtotal, canCheckout, onCheckout }: CartSummaryProps) => {
	const t = useTranslations();
	const locale = useLocale();

	return (
		<div className="bg-card rounded-xl border p-4">
			<h2 className="mb-4 text-lg font-semibold">{t('cart.summary')}</h2>

			<div className="space-y-3 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t('cart.selected_for_order', { count: selectedCount })}</span>
				</div>
				<Separator />
				<div className="flex justify-between text-base font-semibold">
					<span>{t('cart.selected_subtotal')}</span>
					<span className="text-primary">{formatPrice(selectedSubtotal)}</span>
				</div>
			</div>

			<div className="mt-6 space-y-3">
				<Button className="w-full" size="lg" disabled={!canCheckout} onClick={() => onCheckout()}>
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
