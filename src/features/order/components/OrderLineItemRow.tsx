'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { formatPrice } from '@/src/shared/lib/utils';
import { IOrderItem } from '../interfaces';

interface OrderLineItemRowProps {
	item: IOrderItem;
}

const OrderLineItemRow = ({ item }: OrderLineItemRowProps) => (
	<div className="bg-card flex items-center gap-4 rounded-xl border p-4">
		<div className="bg-muted flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
			{item.image_url ? (
				<Image
					src={item.image_url}
					alt={item.product_name}
					width={80}
					height={80}
					className="h-full w-full object-cover"
					unoptimized
				/>
			) : (
				<Package className="text-muted-foreground/40 h-8 w-8" />
			)}
		</div>
		<div className="min-w-0 flex-1">
			<p className="truncate font-medium">{item.product_name}</p>
			<p className="text-muted-foreground text-sm">
				{formatPrice(item.unit_price)} × {item.quantity}
			</p>
		</div>
		<p className="text-primary font-semibold tabular-nums">{formatPrice(item.subtotal)}</p>
	</div>
);

export default OrderLineItemRow;
