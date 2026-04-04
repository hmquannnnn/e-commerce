'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Button } from '@/src/shared/components/base/ui/button';
import { Checkbox } from '@/src/shared/components/base/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/src/core/store/store';
import { setCheckoutDraft } from '@/src/core/store/checkout-draft.slice';
import { useCart } from '../api';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import CartEmpty from './CartEmpty';
import useAppRouter from '@/src/shared/hooks/useAppRouter';
import { ROUTES } from '@/src/shared/constants/routes';

/**
 * Sparse user preferences per cart item. Only tracks explicit changes by the user.
 * Defaults are resolved at render time from cart data via useMemo (no useEffect needed).
 */
type LinePrefs = { selected?: boolean; orderQty?: number };

type ResolvedLine = { selected: boolean; orderQty: number };

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
	const router = useAppRouter();
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const { data: cart, isLoading, isError, refetch } = useCart();

	// Only stores what the user explicitly changed — no sync with useEffect needed.
	const [prefs, setPrefs] = useState<Record<string, LinePrefs>>({});

	// Merge cart items with user prefs. New cart items default to selected=true, qty=max.
	const resolvedLines = useMemo((): Record<string, ResolvedLine> => {
		if (!cart?.items) return {};
		const out: Record<string, ResolvedLine> = {};
		for (const it of cart.items) {
			const p = prefs[it.product_id];
			const max = it.quantity;
			out[it.product_id] = {
				selected: p?.selected ?? true,
				orderQty: p?.orderQty != null ? Math.min(Math.max(1, p.orderQty), max) : max,
			};
		}
		return out;
	}, [cart, prefs]);

	const { selectedSubtotal, selectedCount, hasSelection } = useMemo(() => {
		if (!cart?.items) return { selectedSubtotal: 0, selectedCount: 0, hasSelection: false };
		let sum = 0;
		let count = 0;
		for (const it of cart.items) {
			const s = resolvedLines[it.product_id];
			if (s?.selected) {
				sum += it.unit_price * s.orderQty;
				count += 1;
			}
		}
		return { selectedSubtotal: sum, selectedCount: count, hasSelection: count > 0 };
	}, [cart, resolvedLines]);

	const total = cart?.items.length ?? 0;

	const selectAllState = selectedCount === 0 ? false : selectedCount === total ? true : ('indeterminate' as const);

	const selectAll = useCallback(() => {
		if (!cart?.items) return;
		setPrefs((prev) => {
			const next = { ...prev };
			for (const it of cart.items) {
				next[it.product_id] = { ...next[it.product_id], selected: true, orderQty: it.quantity };
			}
			return next;
		});
	}, [cart]);

	const deselectAll = useCallback(() => {
		if (!cart?.items) return;
		setPrefs((prev) => {
			const next = { ...prev };
			for (const it of cart.items) {
				next[it.product_id] = { ...next[it.product_id], selected: false };
			}
			return next;
		});
	}, [cart]);

	const handleCheckout = useCallback(() => {
		if (!cart?.items.length) return;
		const payload = cart.items
			.filter((it) => resolvedLines[it.product_id]?.selected)
			.map((it) => ({
				product_id: it.product_id,
				quantity: resolvedLines[it.product_id]!.orderQty,
			}));
		if (payload.length === 0) {
			toast.error(t('cart.checkout_select_at_least_one'));
			return;
		}
		dispatch(setCheckoutDraft(payload));
		router.push(ROUTES.CHECKOUT);
	}, [cart, resolvedLines, dispatch, router, t]);

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
			<div className="flex flex-wrap items-center gap-3">
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
						<label className="flex cursor-pointer items-center gap-2">
							<Checkbox
								checked={selectAllState}
								onCheckedChange={(checked) => {
									if (checked === true) selectAll();
									else deselectAll();
								}}
								aria-label={t('cart.select_all_checkbox_aria')}
							/>
							<span className="text-sm font-medium">{t('cart.select_all_checkbox_label')}</span>
						</label>
						<p className="text-muted-foreground text-sm">{t('cart.select_for_checkout_hint')}</p>
						{cart.items.map((item) => (
							<CartItem
								key={item.product_id}
								item={item}
								selection={{
									selected: resolvedLines[item.product_id]?.selected ?? true,
									orderQty: resolvedLines[item.product_id]?.orderQty ?? item.quantity,
									onSelectChange: (selected) =>
										setPrefs((prev) => ({
											...prev,
											[item.product_id]: { ...prev[item.product_id], selected },
										})),
									onOrderQtyChange: (raw) => {
										const orderQty = Math.min(item.quantity, Math.max(1, raw));
										setPrefs((prev) => ({
											...prev,
											[item.product_id]: { ...prev[item.product_id], orderQty },
										}));
									},
								}}
							/>
						))}
					</div>
					<div className="lg:col-span-1">
						<CartSummary
							selectedCount={selectedCount}
							selectedSubtotal={selectedSubtotal}
							canCheckout={hasSelection}
							onCheckout={handleCheckout}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default CartPage;
