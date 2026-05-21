'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ImageOff, Package, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/shared/components/base/ui/button';
import { Skeleton } from '@/src/shared/components/base/ui/skeleton';
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
	<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
		<Skeleton className="aspect-square w-full rounded-[18px]" />
		<div className="space-y-6">
			<Skeleton className="h-5 w-24 rounded-full" />
			<Skeleton className="h-12 w-3/4" />
			<Skeleton className="h-7 w-1/3" />
			<Skeleton className="h-px w-full" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<Skeleton className="h-12 w-full rounded-full" />
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
		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
		};
	}, [api, onSelect]);

	if (!sortedImages.length) {
		return (
			<div className="flex aspect-square items-center justify-center rounded-[18px] bg-canvas-parchment">
				<ImageOff className="h-32 w-32 text-ink-muted-48/30" />
			</div>
		);
	}

	if (sortedImages.length === 1) {
		return (
			<div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-canvas-parchment p-12">
				<div className="shadow-product relative h-full w-full">
					<Image
						src={sortedImages[0].url}
						alt={productName}
						fill
						className="object-contain"
						sizes="(max-width: 768px) 100vw, 50vw"
						unoptimized
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
				<CarouselContent>
					{sortedImages.map((img) => (
						<CarouselItem key={img.id}>
							<div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-canvas-parchment p-12">
								<div className="shadow-product relative h-full w-full">
									<Image
										src={img.url}
										alt={productName}
										fill
										className="object-contain"
										sizes="(max-width: 768px) 100vw, 50vw"
										unoptimized
									/>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="left-4 size-11 rounded-full" />
				<CarouselNext className="right-4 size-11 rounded-full" />
			</Carousel>

			<div className="flex justify-center gap-2">
				{sortedImages.map((img, idx) => (
					<button
						key={img.id}
						onClick={() => api?.scrollTo(idx)}
						className={cn(
							'press relative h-14 w-14 overflow-hidden rounded-[11px] border-2 transition-all',
							current === idx ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'
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
					<AlertCircle className="h-14 w-14 text-destructive" />
					<p className="text-ink-muted-48">{t('product.detail.load_error')}</p>
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
					<Package className="h-20 w-20 text-ink-muted-48/40" />
					<p className="font-medium text-ink-muted-48">{t('product.detail.not_found')}</p>
				</div>
			);
		}

		const specs = product.specs && typeof product.specs === 'object' ? Object.entries(product.specs) : [];

		return (
			<div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
				<ProductImageGallery images={product.images ?? []} productName={product.name} />

				<div className="flex flex-col gap-7 md:sticky md:top-32">
					<div className="space-y-3">
						{categoryName && <p className="text-tagline text-primary">{categoryName}</p>}
						<h1 className="text-display-lg text-ink">{product.name}</h1>
						<p className="text-lead text-ink-muted-80">{product.description || t('product.detail.description')}</p>
					</div>

					<div className="flex flex-col gap-1 border-t border-hairline pt-6">
						<p className="text-caption text-ink-muted-48">{t('product.detail.price_label')}</p>
						<p className="text-display-md text-ink tabular-nums">{formatPrice(product.price)}</p>
					</div>

					{specs.length > 0 && (
						<div className="space-y-3">
							<h2 className="text-tagline text-ink">{t('product.detail.specifications')}</h2>
							<dl className="divide-y divide-hairline rounded-[18px] border border-hairline">
								{specs.map(([key, value]) => (
									<div key={key} className="grid grid-cols-[2fr_3fr] gap-4 px-5 py-3">
										<dt className="text-caption text-ink-muted-48 capitalize">{key}</dt>
										<dd className="text-caption-strong text-ink">{String(value)}</dd>
									</div>
								))}
							</dl>
						</div>
					)}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={addCartItem.isPending}>
							<ShoppingBag className="h-4 w-4" />
							{addCartItem.isPending ? t('cart.adding') : t('product.list.add_to_cart')}
						</Button>
						<Button size="lg" variant="outline" asChild className="flex-1">
							<Link href={`/${locale}${ROUTES.HOME}`}>{t('product.detail.continue_browsing')}</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-8">
			<Link
				href={`/${locale}${ROUTES.HOME}`}
				className="text-caption press inline-flex items-center gap-1.5 text-ink-muted-48 hover:text-ink"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				{t('product.detail.back_to_products')}
			</Link>

			{renderContent()}
		</div>
	);
};

export default ProductDetail;
