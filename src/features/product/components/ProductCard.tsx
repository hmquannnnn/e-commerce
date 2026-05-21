'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/src/shared/components/base/ui/button';
import { IProduct } from '../interfaces';
import { formatPrice } from '@/src/shared/lib/utils';
import { ROUTES } from '@/src/shared/constants/routes';
import { useAddCartItem } from '@/src/features/cart/api';

interface ProductCardProps {
	product: IProduct;
	categoryName?: string;
}

/**
 * `store-utility-card` per DESIGN.md §"Cards & Containers":
 *  - white surface, 1px hairline border, 18px corners (no shadow on the
 *    card itself).
 *  - Apple's signature `shadow-product` filter on the product image so
 *    the render appears to rest on the surface — that is the ONLY shadow
 *    in the entire system.
 *  - product name in `body-strong` (17px / 600), price in `body` (17px /
 *    400), and a single text-link "Buy" / "Add to bag" CTA below.
 */
const ProductCard = ({ product, categoryName }: ProductCardProps) => {
	const t = useTranslations();
	const locale = useLocale();
	const addCartItem = useAddCartItem();

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		addCartItem.mutate(
			{ product_id: product.id, quantity: 1 },
			{
				onSuccess: () => toast.success(t('cart.add_success')),
				onError: () => toast.error(t('cart.add_error')),
			}
		);
	};

	const productHref = `/${locale}${ROUTES.PRODUCTS.DETAIL(product.id)}`;

	return (
		<article className="group flex flex-col overflow-hidden rounded-[18px] border border-hairline bg-canvas transition-colors hover:border-ink-muted-48/40">
			<Link href={productHref} className="block">
				<div className="relative flex aspect-square items-center justify-center overflow-hidden bg-canvas-parchment p-6">
					{product.primary_image_url ? (
						<div className="shadow-product relative h-full w-full">
							<Image
								src={product.primary_image_url}
								alt={product.name}
								fill
								className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
								sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
								unoptimized
								loading="eager"
							/>
						</div>
					) : (
						<Package className="h-20 w-20 text-ink-muted-48/40" />
					)}
					{categoryName && (
						<span className="text-fine absolute top-4 left-4 inline-flex h-6 items-center rounded-full bg-canvas/80 px-2.5 text-ink-muted-80 backdrop-blur-md">
							{categoryName}
						</span>
					)}
				</div>
			</Link>

			<div className="flex flex-1 flex-col gap-3 px-5 py-5">
				<Link href={productHref} className="space-y-1">
					<h3 className="text-body-strong line-clamp-2 text-ink transition-colors group-hover:text-primary">
						{product.name}
					</h3>
					{product.description && <p className="text-caption line-clamp-2 text-ink-muted-48">{product.description}</p>}
				</Link>

				<div className="mt-auto space-y-3">
					<p className="font-medium text-body text-ink tabular-nums">{formatPrice(product.price)}</p>
					<Button
						size="sm"
						variant="default"
						className="w-full gap-2"
						onClick={handleAddToCart}
						disabled={addCartItem.isPending}
					>
						<ShoppingBag className="h-3.5 w-3.5" />
						{addCartItem.isPending ? t('cart.adding') : t('product.list.add_to_cart')}
					</Button>
				</div>
			</div>
		</article>
	);
};

export default ProductCard;
