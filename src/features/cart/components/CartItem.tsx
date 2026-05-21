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
		<div className="flex flex-col gap-4 rounded-[18px] border border-hairline bg-canvas p-5 sm:flex-row sm:items-center">
			<div className="flex min-w-0 flex-1 items-start gap-4">
				{sel && (
					<Checkbox
						checked={sel.selected}
						onCheckedChange={(checked) => sel.onSelectChange(checked === true)}
						className="mt-1.5"
					/>
				)}
				<div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-canvas-parchment">
					{item.image_url ? (
						<Image
							src={item.image_url}
							alt={item.product_name}
							width={96}
							height={96}
							className="shadow-product h-full w-full object-contain"
							unoptimized
							loading="eager"
						/>
					) : (
						<Package className="h-9 w-9 text-ink-muted-48/40" />
					)}
				</div>
				<div className="min-w-0 flex-1 space-y-2">
					<p className="text-body-strong truncate text-ink">{item.product_name}</p>
					<p className="text-caption text-ink-muted-48 tabular-nums">{formatPrice(item.unit_price)}</p>
					<div className="flex items-center gap-3">
						<span className="text-caption text-ink-muted-48">{t('cart.in_cart_qty')}</span>
						<div className="flex items-center gap-2 rounded-full border border-hairline bg-canvas px-1.5 py-0.5">
							<button
								type="button"
								onClick={handleDecrement}
								disabled={isPending}
								aria-label={t('cart.decrease_qty')}
								className="press inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted-80 hover:text-ink disabled:opacity-40"
							>
								<Minus className="h-3 w-3" />
							</button>
							<span className="text-caption-strong w-7 text-center text-ink tabular-nums">{item.quantity}</span>
							<button
								type="button"
								onClick={handleIncrement}
								disabled={isPending}
								aria-label={t('cart.increase_qty')}
								className="press inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted-80 hover:text-ink disabled:opacity-40"
							>
								<Plus className="h-3 w-3" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
				<p className="text-body-strong text-ink tabular-nums sm:min-w-[120px] sm:text-right">
					{sel && sel.selected ? formatPrice(item.unit_price * sel.orderQty) : formatPrice(item.subtotal)}
				</p>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={handleRemove}
					disabled={isPending}
					aria-label={t('cart.remove')}
					className="text-ink-muted-48 hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default CartItem;
