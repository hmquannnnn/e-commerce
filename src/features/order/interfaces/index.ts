export type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'QR_CODE' | 'CASH';

// Statuses an admin can transition an order to from the dashboard. PAID is
// excluded — it is set exclusively by payment-service via the internal
// /mark-paid hook.
export const ADMIN_TRANSITION_STATUSES: OrderStatus[] = ['DELIVERING', 'DELIVERED', 'CANCELLED'];

/** Returns true if the order is in a terminal state (no further transitions). */
export const isTerminalOrderStatus = (s: OrderStatus): boolean => s === 'DELIVERED' || s === 'CANCELLED';

/** Returns true if user/admin is allowed to cancel an order in the given status. */
export const isCancellableStatus = (s: OrderStatus): boolean => s === 'PENDING' || s === 'PAID';

/** Returns true if the order can still be paid via online provider (QR_CODE). */
export const isPayableOnline = (status: OrderStatus, method: PaymentMethod): boolean =>
	status === 'PENDING' && method !== 'CASH';

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
