'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { formatPrice } from '@/src/shared/lib/utils';
import { IOrderItem } from '../interfaces';

interface OrderLineItemRowProps {
	item: IOrderItem;
}

const OrderLineItemRow = ({ item }: OrderLineItemRowProps) => (
	<div className="flex items-center gap-4 rounded-[18px] border border-hairline bg-canvas p-5">
		<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-canvas-parchment">
			{item.image_url ? (
				<Image
					src={item.image_url}
					alt={item.product_name}
					width={80}
					height={80}
					className="shadow-product h-full w-full object-contain"
					unoptimized
				/>
			) : (
				<Package className="h-8 w-8 text-ink-muted-48/40" />
			)}
		</div>
		<div className="min-w-0 flex-1">
			<p className="text-body-strong truncate text-ink">{item.product_name}</p>
			<p className="text-caption text-ink-muted-48 tabular-nums">
				{formatPrice(item.unit_price)} × {item.quantity}
			</p>
		</div>
		<p className="text-body-strong text-ink tabular-nums">{formatPrice(item.subtotal)}</p>
	</div>
);

export default OrderLineItemRow;
