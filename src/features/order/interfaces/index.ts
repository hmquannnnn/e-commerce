export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'CANCELLED';
export type PaymentMethod = 'VNPAY' | 'CASH';

export interface IOrderItem {
	product_id: string;
	product_name: string;
	unit_price: number;
	image_url?: string;
	quantity: number;
	subtotal: number;
}

export interface IOrder {
	id: string;
	user_id: string;
	total_price: number;
	status: OrderStatus;
	payment_method: PaymentMethod;
	items: IOrderItem[];
	created_at: string;
	updated_at: string;
}

export interface IOrderListItem {
	id: string;
	user_id: string;
	total_price: number;
	status: OrderStatus;
	payment_method: PaymentMethod;
	created_at: string;
	updated_at: string;
}

export interface ICreateOrderItem {
	product_id: string;
	quantity: number;
}

export interface ICreateOrderRequest {
	payment_method: PaymentMethod;
	items: ICreateOrderItem[];
}

export interface IOrderListResponse {
	items: IOrderListItem[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
}
