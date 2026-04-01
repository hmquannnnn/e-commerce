'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { ROUTES } from '@/src/shared/constants/routes';

const CartEmpty = () => {
	const t = useTranslations();
	const locale = useLocale();

	return (
		<div className="flex flex-col items-center justify-center gap-6 py-24">
			<div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
				<ShoppingCart className="text-muted-foreground/50 h-12 w-12" />
			</div>
			<div className="text-center">
				<p className="text-xl font-semibold">{t('cart.empty_title')}</p>
				<p className="text-muted-foreground mt-1 text-sm">{t('cart.empty_description')}</p>
			</div>
			<Button asChild>
				<Link href={`/${locale}${ROUTES.HOME}`}>{t('cart.continue_shopping')}</Link>
			</Button>
		</div>
	);
};

export default CartEmpty;
