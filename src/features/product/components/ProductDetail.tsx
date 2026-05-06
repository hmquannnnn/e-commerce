'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ImageOff, Package, ShoppingCart, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/shared/components/base/ui/button';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
import { Separator } from '@/src/shared/components/base/ui/separator';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	type CarouselApi,
} from '@/src/shared/components/base/ui/carousel';
import { cn, formatPrice } from '@/src/shared/lib/utils';
import { useProduct, useCategories } from '../api';
import { ROUTES } from '@/src/shared/constants/routes';
import { useAddCartItem } from '@/src/features/cart/api';
import type { IProductImage } from '../interfaces';

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

const ProductImageGallery = ({ images, productName }: { images: IProductImage[]; productName: string }) => {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	const sortedImages = useMemo(() => {
		if (!images.length) return [];
		const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
		const primaryIdx = sorted.findIndex((img) => img.is_primary);
		if (primaryIdx > 0) {
			const [primary] = sorted.splice(primaryIdx, 1);
			sorted.unshift(primary);
		}
		return sorted;
	}, [images]);

	const onSelect = useCallback(() => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
	}, [api]);

	useEffect(() => {
		if (!api) return;
		// Only sync from Embla's `select` events — avoid synchronous setState in the effect body (eslint).
		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
		};
	}, [api, onSelect]);

	if (!sortedImages.length) {
		return (
			<div className="bg-muted flex aspect-square items-center justify-center rounded-2xl">
				<ImageOff className="text-muted-foreground/30 h-32 w-32" />
			</div>
		);
	}

	if (sortedImages.length === 1) {
		return (
			<div className="bg-muted relative aspect-square overflow-hidden rounded-2xl">
				<Image
					src={sortedImages[0].url}
					alt={productName}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, 50vw"
					unoptimized
				/>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
				<CarouselContent>
					{sortedImages.map((img) => (
						<CarouselItem key={img.id}>
							<div className="bg-muted relative aspect-square overflow-hidden rounded-2xl">
								<Image
									src={img.url}
									alt={productName}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 50vw"
									unoptimized
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="bg-background/80 left-3 backdrop-blur-sm" />
				<CarouselNext className="bg-background/80 right-3 backdrop-blur-sm" />
			</Carousel>

			{/* Thumbnails */}
			<div className="flex justify-center gap-2">
				{sortedImages.map((img, idx) => (
					<button
						key={img.id}
						onClick={() => api?.scrollTo(idx)}
						className={cn(
							'relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-all',
							current === idx
								? 'border-primary ring-primary/25 ring-2'
								: 'border-transparent opacity-60 hover:opacity-100'
						)}
					>
						<Image src={img.url} alt="" fill className="object-cover" sizes="56px" unoptimized />
					</button>
				))}
			</div>
		</div>
	);
};

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
				{/* Image gallery */}
				<ProductImageGallery images={product.images ?? []} productName={product.name} />

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
