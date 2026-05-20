import type { OrderStatus } from '@/src/features/order/interfaces';

export const ADMIN_ORDER_QUERY_KEYS = {
	all: ['admin', 'orders'] as const,
	lists: () => [...ADMIN_ORDER_QUERY_KEYS.all, 'list'] as const,
	list: (page: number, limit: number, status?: OrderStatus, search = '') =>
		[...ADMIN_ORDER_QUERY_KEYS.lists(), page, limit, status ?? 'ALL', search] as const,
	detail: (id: string) => [...ADMIN_ORDER_QUERY_KEYS.all, 'detail', id] as const,
};
