'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { ROUTES } from '@/src/shared/constants/routes';

const CartEmpty = () => {
	const t = useTranslations();
	const locale = useLocale();

	return (
		<div className="flex flex-col items-center justify-center gap-6 rounded-[18px] bg-canvas-parchment py-24">
			<div className="flex h-24 w-24 items-center justify-center rounded-full border border-hairline bg-canvas">
				<ShoppingBag className="h-10 w-10 text-ink-muted-48" />
			</div>
			<div className="text-center">
				<p className="text-display-md text-ink">{t('cart.empty_title')}</p>
				<p className="text-lead mt-2 text-ink-muted-80">{t('cart.empty_description')}</p>
			</div>
			<Button asChild>
				<Link href={`/${locale}${ROUTES.HOME}`}>{t('cart.continue_shopping')}</Link>
			</Button>
		</div>
	);
};

export default CartEmpty;
