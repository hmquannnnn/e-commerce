'use client';

import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/src/shared/components/base/ui/button';
import { formatPrice } from '@/src/shared/lib/utils';
import { ICartItem } from '../interfaces';
import { useUpdateCartItem, useRemoveCartItem } from '../api';

interface CartItemProps {
	item: ICartItem;
}

const CartItem = ({ item }: CartItemProps) => {
	const t = useTranslations();
	const updateItem = useUpdateCartItem();
	const removeItem = useRemoveCartItem();

	const handleDecrement = () => {
		if (item.quantity <= 1) {
			removeItem.mutate(item.product_id);
		} else {
			updateItem.mutate({ productId: item.product_id, data: { quantity: item.quantity - 1 } });
		}
	};

	const handleIncrement = () => {
		updateItem.mutate({ productId: item.product_id, data: { quantity: item.quantity + 1 } });
	};

	const handleRemove = () => {
		removeItem.mutate(item.product_id);
	};

	const isPending = updateItem.isPending || removeItem.isPending;

	return (
		<div className="bg-card flex items-center gap-4 rounded-xl border p-4">
			{/* Thumbnail */}
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

			{/* Info */}
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium">{item.product_name}</p>
				<p className="text-muted-foreground text-sm">{formatPrice(item.unit_price)}</p>
			</div>

			{/* Qty controls */}
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={handleDecrement}
					disabled={isPending}
					aria-label={t('cart.decrease_qty')}
				>
					<Minus className="h-3 w-3" />
				</Button>
				<span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={handleIncrement}
					disabled={isPending}
					aria-label={t('cart.increase_qty')}
				>
					<Plus className="h-3 w-3" />
				</Button>
			</div>

			{/* Subtotal */}
			<p className="text-primary hidden min-w-[100px] text-right font-semibold sm:block">
				{formatPrice(item.subtotal)}
			</p>

			{/* Remove */}
			<Button
				variant="ghost"
				size="icon"
				className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
				onClick={handleRemove}
				disabled={isPending}
				aria-label={t('cart.remove')}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default CartItem;
