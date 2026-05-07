'use client';

import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/src/shared/components/base/ui/button';
import { Checkbox } from '@/src/shared/components/base/ui/checkbox';
import { formatPrice } from '@/src/shared/lib/utils';
import { ICartItem } from '../interfaces';
import { useUpdateCartItem, useRemoveCartItem } from '../api';

export interface ICartItemSelection {
	selected: boolean;
	onSelectChange: (selected: boolean) => void;
	orderQty: number;
	onOrderQtyChange: (qty: number) => void;
}

interface CartItemProps {
	item: ICartItem;
	/** Khi có: hiển thị checkbox + số lượng đặt trong đơn (≤ số trong giỏ). */
	selection?: ICartItemSelection;
}

const CartItem = ({ item, selection }: CartItemProps) => {
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
	const sel = selection;

	return (
		<div className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
			<div className="flex min-w-0 flex-1 items-start gap-3">
				{sel && (
					<Checkbox
						checked={sel.selected}
						onCheckedChange={(checked) => sel.onSelectChange(checked === true)}
						className="mt-1"
					/>
				)}
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
					<p className="truncate font-medium">{item.product_name}</p>
					<p className="text-muted-foreground text-sm">{formatPrice(item.unit_price)}</p>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-xs">{t('cart.in_cart_qty')}:</span>
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
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
				<p className="text-primary text-right font-semibold sm:min-w-[100px]">
					{sel && sel.selected ? formatPrice(item.unit_price * sel.orderQty) : formatPrice(item.subtotal)}
				</p>
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
		</div>
	);
};

export default CartItem;
