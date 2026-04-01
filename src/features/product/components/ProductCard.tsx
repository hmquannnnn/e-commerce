'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/src/shared/components/base/ui/card';
import { Badge } from '@/src/shared/components/base/ui/badge';
import { Button } from '@/src/shared/components/base/ui/button';
import { IProduct } from '../interfaces';
import { ShoppingCart, Package } from 'lucide-react';
import { formatPrice } from '@/src/shared/lib/utils';
import { ROUTES } from '@/src/shared/constants/routes';
import { useAddCartItem } from '@/src/features/cart/api';

interface ProductCardProps {
	product: IProduct;
	categoryName?: string;
}

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

	return (
		<Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
			<Link href={`/${locale}${ROUTES.PRODUCTS.DETAIL(product.id)}`} className="block">
				<div className="bg-muted relative aspect-square overflow-hidden">
					<div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
						<Package className="text-muted-foreground/40 h-16 w-16" />
					</div>
					{categoryName && (
						<Badge variant="secondary" className="absolute left-2 top-2 text-xs">
							{categoryName}
						</Badge>
					)}
				</div>
			</Link>

			<CardContent className="flex flex-1 flex-col gap-2 p-4">
				<Link href={`/${locale}${ROUTES.PRODUCTS.DETAIL(product.id)}`}>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:underline">{product.name}</h3>
				</Link>
				{product.description && <p className="text-muted-foreground line-clamp-2 text-xs">{product.description}</p>}
				<p className="text-primary mt-auto text-base font-bold">{formatPrice(product.price)}</p>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button size="sm" className="w-full gap-2" onClick={handleAddToCart} disabled={addCartItem.isPending}>
					<ShoppingCart className="h-4 w-4" />
					{addCartItem.isPending ? t('cart.adding') : t('product.list.add_to_cart')}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default ProductCard;
