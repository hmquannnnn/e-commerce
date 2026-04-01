export interface ICartItem {
	product_id: string;
	product_name: string;
	unit_price: number;
	image_url?: string;
	quantity: number;
	subtotal: number;
	updated_at: string;
}

export interface ICart {
	items: ICartItem[];
	total_quantity: number;
	total_price: number;
}

export interface IAddCartItemRequest {
	product_id: string;
	quantity: number;
}

export interface IUpdateCartItemRequest {
	quantity: number;
}
