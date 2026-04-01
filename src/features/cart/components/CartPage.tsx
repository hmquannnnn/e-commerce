'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Button } from '@/src/shared/components/base/ui/button';
import { useAppSelector } from '@/src/core/store/store';
import { useCart } from '../api';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import CartEmpty from './CartEmpty';

const CartPageSkeleton = () => (
	<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div className="space-y-4 lg:col-span-2">
			{[1, 2, 3].map((i) => (
				<Skeleton key={i} className="h-28 w-full rounded-xl" />
			))}
		</div>
		<Skeleton className="h-64 w-full rounded-xl" />
	</div>
);

const CartPage = () => {
	const t = useTranslations();
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const { data: cart, isLoading, isError, refetch } = useCart();

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-muted-foreground h-14 w-14" />
				<p className="text-muted-foreground">{t('cart.login_required')}</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-40" />
				<CartPageSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-destructive h-14 w-14" />
				<p className="text-muted-foreground">{t('cart.load_error')}</p>
				<Button variant="outline" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	const isEmpty = !cart || cart.items.length === 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<ShoppingCart className="h-6 w-6" />
				<h1 className="text-2xl font-bold">{t('cart.title')}</h1>
				{!isEmpty && (
					<span className="text-muted-foreground text-sm">
						({t('cart.item_count', { count: cart.total_quantity })})
					</span>
				)}
			</div>

			{isEmpty ? (
				<CartEmpty />
			) : (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="space-y-4 lg:col-span-2">
						{cart.items.map((item) => (
							<CartItem key={item.product_id} item={item} />
						))}
					</div>
					<div className="lg:col-span-1">
						<CartSummary cart={cart} />
					</div>
				</div>
			)}
		</div>
	);
};

export default CartPage;
