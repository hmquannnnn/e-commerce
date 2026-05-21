'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, CreditCard, RefreshCw, Loader2, Package } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { Input } from '@/src/shared/components/base/ui/input';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/base/ui/select';
import {
	SearchableCombobox,
	type ISearchableComboboxItem,
} from '@/src/shared/components/base/ui/searchable-combobox';
import { useAppDispatch, useAppSelector } from '@/src/core/store/store';
import { clearCheckoutDraft } from '@/src/core/store/checkout-draft.slice';
import { ROUTES } from '@/src/shared/constants/routes';
import { formatPrice } from '@/src/shared/lib/utils';
import { useCart } from '@/src/features/cart/api';
import { useDistricts, useProvinces, useWards } from '@/src/features/location/api';
import { useCreateOrder, getOrderErrorCode } from '../api';
import { useCreatePayment } from '@/src/features/payment/api';
import type { ICartItem } from '@/src/features/cart/interfaces';
import type { PaymentMethod } from '../interfaces';
import type { PaymentMethod as ProviderPaymentMethod, PaymentProvider } from '@/src/features/payment/interfaces';
import useAppRouter from '@/src/shared/hooks/useAppRouter';

const CheckoutSkeleton = () => (
	<div className="space-y-4">
		{[1, 2].map((i) => (
			<Skeleton key={i} className="h-28 w-full rounded-xl" />
		))}
	</div>
);

function CheckoutReadonlyLine({ item, quantity }: { item: ICartItem; quantity: number }) {
	return (
		<div className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
			<div className="flex min-w-0 flex-1 gap-3">
				<div className="bg-muted flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
					{item.image_url ? (
						<Image
							src={item.image_url}
							alt={item.product_name}
							width={80}
							height={80}
							className="h-full w-full object-cover"
							unoptimized
							loading="eager"
						/>
					) : (
						<Package className="text-muted-foreground/40 h-8 w-8" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-medium">{item.product_name}</p>
					<p className="text-muted-foreground text-sm">{formatPrice(item.unit_price)}</p>
					<p className="text-muted-foreground mt-1 text-sm tabular-nums">× {quantity}</p>
				</div>
			</div>
			<p className="text-primary text-right font-semibold sm:min-w-[100px]">
				{formatPrice(item.unit_price * quantity)}
			</p>
		</div>
	);
}

const CheckoutPage = () => {
	const t = useTranslations();
	const locale = useLocale();
	const router = useAppRouter();
	const dispatch = useAppDispatch();
	const draftLines = useAppSelector((s) => s.checkoutDraft.lines);
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	const { data: cart, isLoading, isError, refetch } = useCart();
	const createOrder = useCreateOrder();
	const createPayment = useCreatePayment();
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
	const [shippingPhone, setShippingPhone] = useState('');
	const [provinceCode, setProvinceCode] = useState('');
	const [districtCode, setDistrictCode] = useState('');
	const [wardCode, setWardCode] = useState('');
	const [addressDetail, setAddressDetail] = useState('');

	const { data: provinces, isLoading: isLoadingProvinces } = useProvinces();
	const { data: districts, isLoading: isLoadingDistricts } = useDistricts(provinceCode);
	const { data: wards, isLoading: isLoadingWards } = useWards(districtCode);

	const provinceItems = useMemo<ISearchableComboboxItem[]>(
		() =>
			(provinces ?? []).map((p) => ({
				value: p.code,
				label: p.name,
				searchText: `${p.name} ${p.code_name}`,
			})),
		[provinces]
	);
	const districtItems = useMemo<ISearchableComboboxItem[]>(
		() =>
			(districts ?? []).map((d) => ({
				value: d.code,
				label: d.name,
				searchText: `${d.name} ${d.code_name}`,
			})),
		[districts]
	);
	const wardItems = useMemo<ISearchableComboboxItem[]>(
		() =>
			(wards ?? []).map((w) => ({
				value: w.code,
				label: w.name,
				searchText: `${w.name} ${w.code_name}`,
			})),
		[wards]
	);

	const selectedProvince = useMemo(
		() => provinces?.find((p) => p.code === provinceCode),
		[provinces, provinceCode]
	);
	const selectedDistrict = useMemo(
		() => districts?.find((d) => d.code === districtCode),
		[districts, districtCode]
	);
	const selectedWard = useMemo(() => wards?.find((w) => w.code === wardCode), [wards, wardCode]);

	const handleProvinceChange = (next: string) => {
		setProvinceCode(next);
		setDistrictCode('');
		setWardCode('');
	};

	const handleDistrictChange = (next: string) => {
		setDistrictCode(next);
		setWardCode('');
	};
	// Controls the entire submit → order → payment → redirect lifecycle.
	// While true the component renders a processing state, preventing any
	// flash to empty-cart or skeleton caused by the cart being invalidated
	// after order creation.
	const [isSubmitting, setIsSubmitting] = useState(false);
	const submitLockedRef = useRef(false);

	const resolvedLines = useMemo(() => {
		if (!draftLines?.length) return [];
		if (!cart?.items?.length) return null;
		const byId = new Map(cart.items.map((it) => [it.product_id, it]));
		const out: { item: ICartItem; quantity: number }[] = [];
		for (const d of draftLines) {
			const item = byId.get(d.product_id);
			if (!item || d.quantity < 1 || d.quantity > item.quantity) return null;
			out.push({ item, quantity: d.quantity });
		}
		return out;
	}, [cart, draftLines]);

	useEffect(() => {
		if (!isAuthenticated || isLoading || isSubmitting) return;
		if (!draftLines?.length) {
			router.push(ROUTES.CART);
			return;
		}
		if (!cart) return;
		if (cart.items.length === 0 || resolvedLines === null) {
			toast.error(t('order.checkout_draft_invalid'));
			dispatch(clearCheckoutDraft());
			router.push(ROUTES.CART);
		}
	}, [isAuthenticated, isLoading, isSubmitting, draftLines, cart, resolvedLines, router, dispatch, t]);

	const selectedSubtotal = useMemo(() => {
		if (!resolvedLines?.length) return 0;
		return resolvedLines.reduce((s, { item, quantity }) => s + item.unit_price * quantity, 0);
	}, [resolvedLines]);

	// ── Callbacks ────────────────────────────────────────────────────────────

	const createProviderPayment = (orderId: string, amount: number) => {
		const provider: PaymentProvider = 'payos';
		const providerPaymentMethod: ProviderPaymentMethod = 'qr_code';
		const origin = window.location.origin;
		const resultBase = `${origin}/${locale}${ROUTES.PAYMENT.RESULT}?orderId=${orderId}`;
		createPayment.mutate(
			{
				order_id: orderId,
				provider,
				payment_method: providerPaymentMethod,
				amount: Math.round(amount),
				currency: 'VND',
				return_url: `${resultBase}&state=success`,
				cancel_url: `${resultBase}&state=cancel`,
			},
			{
				onSuccess: (payment) => {
					if (!payment.checkout_url) {
						toast.error(t('order.payment_error_generic'));
						submitLockedRef.current = false;
						setIsSubmitting(false);
						router.push(ROUTES.ORDERS.DETAIL(orderId));
						return;
					}
					dispatch(clearCheckoutDraft());
					window.location.assign(payment.checkout_url);
				},
				onError: () => {
					toast.error(t('order.payment_error_generic'));
					submitLockedRef.current = false;
					setIsSubmitting(false);
					router.push(ROUTES.ORDERS.DETAIL(orderId));
				},
			}
		);
	};

	const handleSubmit = () => {
		if (submitLockedRef.current) return;
		if (!draftLines?.length || !resolvedLines?.length) return;

		const shippingPhoneValue = shippingPhone.trim();
		const addressDetailValue = addressDetail.trim();
		if (!shippingPhoneValue || !selectedProvince || !selectedDistrict || !selectedWard || !addressDetailValue) {
			toast.error(t('order.shipping_required'));
			return;
		}

		// Compose backend-friendly single-line address (short names per UX choice):
		// "<street>, <ward>, <district>, <province>"
		const shippingAddressValue = [
			addressDetailValue,
			selectedWard.name,
			selectedDistrict.name,
			selectedProvince.name,
		].join(', ');

		if (shippingPhoneValue.length > 20 || shippingAddressValue.length > 500) {
			toast.error(t('order.shipping_invalid'));
			return;
		}

		submitLockedRef.current = true;
		setIsSubmitting(true);

		const items = resolvedLines.map(({ item, quantity }) => ({
			product_id: item.product_id,
			quantity,
		}));

		// Order-service persists the chosen method as-is (CASH | QR_CODE).
		// Provider routing happens only when we actually create a payment intent.
		createOrder.mutate(
			{
				payment_method: paymentMethod,
				shipping_phone: shippingPhoneValue,
				shipping_address: shippingAddressValue,
				items,
			},
			{
				onSuccess: (order) => {
					toast.success(t('order.place_order_success'));

					if (paymentMethod === 'CASH') {
						dispatch(clearCheckoutDraft());
						router.push(ROUTES.ORDERS.DETAIL(order.id));
						return;
					}

					createProviderPayment(order.id, order.total_price);
				},
				onError: (err) => {
					submitLockedRef.current = false;
					setIsSubmitting(false);
					const code = getOrderErrorCode(err);
					if (code === 'CART_EMPTY') toast.error(t('order.error_cart_empty'));
					else if (code === 'INVALID_ORDER_ITEMS') toast.error(t('order.error_invalid_order_items'));
					else if (code === 'CART_CHANGED') toast.error(t('order.error_cart_changed'));
					else if (code === 'INSUFFICIENT_STOCK') toast.error(t('order.error_stock'));
					else if (code === 'PRODUCT_NOT_FOUND') toast.error(t('order.error_product'));
					else if (code === 'INVALID_SHIPPING_INFO') toast.error(t('order.shipping_invalid'));
					else toast.error(t('order.place_order_error'));
				},
			}
		);
	};

	// ── Render guards ────────────────────────────────────────────────────────

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-muted-foreground h-14 w-14" />
				<p className="text-muted-foreground">{t('order.checkout_login_required')}</p>
				<Button asChild>
					<Link href={`/${locale}${ROUTES.AUTH.LOGIN}`}>{t('common.login')}</Link>
				</Button>
			</div>
		);
	}

	// Processing state — shown while creating order + waiting for payment
	// provider checkout URL. Prevents any cart-empty flash.
	if (isSubmitting) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<Loader2 className="text-primary h-10 w-10 animate-spin" />
				<p className="text-muted-foreground">{t('order.placing')}</p>
			</div>
		);
	}

	if (isLoading || !draftLines?.length) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<CheckoutSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-24">
				<AlertCircle className="text-destructive h-14 w-14" />
				<p className="text-muted-foreground">{t('order.load_error')}</p>
				<Button variant="outline" onClick={() => refetch()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	const isEmpty = !cart || cart.items.length === 0;
	const invalid = resolvedLines === null;
	const showContent = Boolean(!isEmpty && !invalid && resolvedLines && resolvedLines.length > 0);

	const renderCheckoutContent = () => {
		if (isEmpty || invalid) {
			return (
				<div className="flex flex-col items-center gap-4 py-16">
					<p className="text-muted-foreground">{t('order.checkout_empty')}</p>
					<Button asChild>
						<Link href={`/${locale}${ROUTES.CART}`}>{t('cart.title')}</Link>
					</Button>
				</div>
			);
		}

		if (!showContent) {
			return <CheckoutSkeleton />;
		}

		return (
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<p className="text-muted-foreground text-sm">{t('order.checkout_locked_hint')}</p>
					{resolvedLines.map(({ item, quantity }) => (
						<CheckoutReadonlyLine key={item.product_id} item={item} quantity={quantity} />
					))}
				</div>

				<div className="bg-card h-fit space-y-6 rounded-xl border p-6 lg:col-span-1">
					<div className="space-y-4">
						<p className="text-sm font-medium">{t('order.shipping_info')}</p>
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="shipping-phone">
								{t('order.shipping_phone')}
							</label>
							<Input
								id="shipping-phone"
								value={shippingPhone}
								onChange={(event) => setShippingPhone(event.target.value)}
								placeholder={t('order.shipping_phone_placeholder')}
								maxLength={20}
								autoComplete="tel"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">{t('order.shipping_province')}</label>
							<SearchableCombobox
								items={provinceItems}
								value={provinceCode}
								onChange={handleProvinceChange}
								isLoading={isLoadingProvinces}
								placeholder={t('order.shipping_province_placeholder')}
								searchPlaceholder={t('order.shipping_search_placeholder')}
								emptyText={t('order.shipping_empty_results')}
								loadingText={t('common.loading')}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">{t('order.shipping_district')}</label>
							<SearchableCombobox
								items={districtItems}
								value={districtCode}
								onChange={handleDistrictChange}
								disabled={!provinceCode}
								isLoading={isLoadingDistricts}
								placeholder={t('order.shipping_district_placeholder')}
								disabledHint={t('order.shipping_district_disabled')}
								searchPlaceholder={t('order.shipping_search_placeholder')}
								emptyText={t('order.shipping_empty_results')}
								loadingText={t('common.loading')}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">{t('order.shipping_ward')}</label>
							<SearchableCombobox
								items={wardItems}
								value={wardCode}
								onChange={setWardCode}
								disabled={!districtCode}
								isLoading={isLoadingWards}
								placeholder={t('order.shipping_ward_placeholder')}
								disabledHint={t('order.shipping_ward_disabled')}
								searchPlaceholder={t('order.shipping_search_placeholder')}
								emptyText={t('order.shipping_empty_results')}
								loadingText={t('common.loading')}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="shipping-detail">
								{t('order.shipping_address_detail')}
							</label>
							<Input
								id="shipping-detail"
								value={addressDetail}
								onChange={(event) => setAddressDetail(event.target.value)}
								placeholder={t('order.shipping_address_detail_placeholder')}
								maxLength={200}
								autoComplete="street-address"
							/>
						</div>
					</div>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">{t('order.checkout_selected_total')}</span>
							<span className="font-semibold">{formatPrice(selectedSubtotal)}</span>
						</div>
						<Separator />
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t('order.payment_method')}</label>
						<Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="CASH">{t('order.payment_cash')}</SelectItem>
								<SelectItem value="QR_CODE">{t('order.payment_qr_code')}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
						{t('order.place_order')}
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-8">
			<Link
				href={`/${locale}${ROUTES.CART}`}
				className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				{t('order.back_to_cart')}
			</Link>

			<div className="flex items-center gap-3">
				<CreditCard className="h-6 w-6" />
				<h1 className="text-2xl font-bold">{t('order.checkout_title')}</h1>
			</div>

			{renderCheckoutContent()}
		</div>
	);
};

export default CheckoutPage;
