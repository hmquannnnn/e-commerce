export type PaymentProvider = 'payos';
export type PaymentMethod = 'qr_code';
export type PaymentStatus =
	| 'pending'
	| 'requires_action'
	| 'processing'
	| 'succeeded'
	| 'failed'
	| 'canceled'
	| 'expired'
	| 'refunded_partial'
	| 'refunded_full';

export interface ICreatePaymentRequest {
	order_id: string;
	provider: PaymentProvider;
	payment_method: PaymentMethod;
	amount: number;
	currency: string;
	return_url?: string;
	cancel_url?: string;
}

export interface IPayment {
	id: string;
	order_id: string;
	user_id: string;
	provider: PaymentProvider;
	payment_method: PaymentMethod;
	amount: number;
	currency: string;
	status: PaymentStatus;
	provider_payment_id?: string;
	provider_transaction_ref?: string;
	checkout_url?: string;
	expires_at?: string;
	created_at: string;
	updated_at: string;
}
