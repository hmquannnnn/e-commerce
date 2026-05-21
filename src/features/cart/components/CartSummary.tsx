'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
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
		<aside className="sticky top-32 rounded-[18px] bg-canvas-parchment p-6">
			<h2 className="text-tagline mb-5 text-ink">{t('cart.summary')}</h2>

			<div className="space-y-4">
				<div className="flex items-baseline justify-between">
					<span className="text-caption text-ink-muted-48">
						{t('cart.selected_for_order', { count: selectedCount })}
					</span>
				</div>

				<div className="border-t border-hairline pt-4">
					<div className="flex items-baseline justify-between gap-3">
						<span className="text-body-strong text-ink">{t('cart.selected_subtotal')}</span>
						<span className="text-display-md text-ink tabular-nums">{formatPrice(selectedSubtotal)}</span>
					</div>
				</div>
			</div>

			<div className="mt-7 space-y-3">
				<Button className="w-full" size="lg" disabled={!canCheckout} onClick={onCheckout}>
					{t('cart.checkout')}
				</Button>
				<Button variant="ghost" className="w-full gap-2" size="lg" asChild>
					<Link href={`/${locale}${ROUTES.HOME}`}>
						<ArrowLeft className="h-4 w-4" />
						{t('cart.continue_shopping')}
					</Link>
				</Button>
			</div>
		</aside>
	);
};

export default CartSummary;
