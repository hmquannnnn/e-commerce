export const PAYMENT_QUERY_KEYS = {
	all: ['payments'] as const,
	byOrder: (orderId: string) => [...PAYMENT_QUERY_KEYS.all, 'order', orderId] as const,
	detail: (id: string) => [...PAYMENT_QUERY_KEYS.all, 'detail', id] as const,
};
