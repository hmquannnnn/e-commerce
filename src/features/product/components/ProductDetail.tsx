'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Package, ShoppingCart, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Separator } from '@/src/shared/components/base/ui/separator';
import { formatPrice } from '@/src/shared/lib/utils';
import { useProduct, useCategories } from '../api';
import { ROUTES } from '@/src/shared/constants/routes';
import { useAddCartItem } from '@/src/features/cart/api';

interface ProductDetailProps {
	id: string;
}

const ProductDetailSkeleton = () => (
	<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
		<Skeleton className="aspect-square w-full rounded-2xl" />
		<div className="space-y-5">
			<Skeleton className="h-5 w-24" />
			<Skeleton className="h-9 w-3/4" />
			<Skeleton className="h-7 w-1/3" />
			<Skeleton className="h-px w-full" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<Skeleton className="h-11 w-full" />
		</div>
	</div>
);

const ProductDetail = ({ id }: ProductDetailProps) => {
	const t = useTranslations();
	const locale = useLocale();
	const { data: product, isLoading, isError, refetch } = useProduct(id);
	const { data: categories } = useCategories();
	const addCartItem = useAddCartItem();

	const handleAddToCart = () => {
		if (!product) return;
		addCartItem.mutate(
			{ product_id: product.id, quantity: 1 },
			{
				onSuccess: () => toast.success(t('cart.add_success')),
				onError: () => toast.error(t('cart.add_error')),
			}
		);
	};

	const categoryName = product?.category_id ? categories?.find((c) => c.id === product.category_id)?.name : undefined;

	const renderContent = () => {
		if (isError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 py-24">
					<AlertCircle className="text-destructive h-14 w-14" />
					<p className="text-muted-foreground">{t('product.detail.load_error')}</p>
					<Button variant="outline" onClick={() => refetch()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						{t('common.retry')}
					</Button>
				</div>
			);
		}

		if (isLoading) {
			return <ProductDetailSkeleton />;
		}

		if (!product) {
			return (
				<div className="flex flex-col items-center justify-center gap-3 py-24">
					<Package className="text-muted-foreground/40 h-20 w-20" />
					<p className="text-muted-foreground font-medium">{t('product.detail.not_found')}</p>
				</div>
			);
		}

		const specs = product.specs && typeof product.specs === 'object' ? Object.entries(product.specs) : [];

		return (
			<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
				{/* Image */}
				<div className="bg-muted flex aspect-square items-center justify-center rounded-2xl">
					<Package className="text-muted-foreground/30 h-32 w-32" />
				</div>

				{/* Info */}
				<div className="flex flex-col gap-5">
					{/* Category + name */}
					<div className="space-y-2">
						{categoryName && (
							<Badge variant="secondary" className="gap-1.5">
								<Tag className="h-3 w-3" />
								{categoryName}
							</Badge>
						)}
						<h1 className="text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>
						<p className="text-primary text-3xl font-bold">{formatPrice(product.price)}</p>
					</div>

					<Separator />

					{/* Description */}
					{product.description && (
						<div className="space-y-2">
							<h2 className="font-semibold">{t('product.detail.description')}</h2>
							<p className="text-muted-foreground leading-relaxed">{product.description}</p>
						</div>
					)}

					{/* Specs */}
					{specs.length > 0 && (
						<div className="space-y-3">
							<h2 className="font-semibold">{t('product.detail.specifications')}</h2>
							<div className="rounded-lg border">
								{specs.map(([key, value], idx) => (
									<div key={key} className={`flex px-4 py-2.5 text-sm ${idx % 2 === 0 ? 'bg-muted/50' : ''}`}>
										<span className="text-muted-foreground w-2/5 capitalize">{key}</span>
										<span className="w-3/5 font-medium">{String(value)}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="mt-auto pt-2">
						<Button size="lg" className="w-full gap-2" onClick={handleAddToCart} disabled={addCartItem.isPending}>
							<ShoppingCart className="h-5 w-5" />
							{addCartItem.isPending ? t('cart.adding') : t('product.list.add_to_cart')}
						</Button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Back link */}
			<Link
				href={`/${locale}${ROUTES.HOME}`}
				className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				{t('product.detail.back_to_products')}
			</Link>

			{renderContent()}
		</div>
	);
};

export default ProductDetail;
