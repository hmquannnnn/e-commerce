import type { OrderStatus } from '@/src/features/order/interfaces';

export const ADMIN_ORDER_QUERY_KEYS = {
	all: ['admin', 'orders'] as const,
	lists: () => [...ADMIN_ORDER_QUERY_KEYS.all, 'list'] as const,
	list: (page: number, limit: number, status?: OrderStatus) =>
		[...ADMIN_ORDER_QUERY_KEYS.lists(), page, limit, status ?? 'ALL'] as const,
};
