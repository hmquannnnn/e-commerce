export const ADMIN_PRODUCT_QUERY_KEYS = {
	all: ['admin', 'products'] as const,
	lists: () => [...ADMIN_PRODUCT_QUERY_KEYS.all, 'list'] as const,
	list: (params: unknown) => [...ADMIN_PRODUCT_QUERY_KEYS.lists(), params] as const,
	detail: (id: string) => [...ADMIN_PRODUCT_QUERY_KEYS.all, 'detail', id] as const,
	inventory: (productId: string) => [...ADMIN_PRODUCT_QUERY_KEYS.all, 'inventory', productId] as const,
	newId: () => [...ADMIN_PRODUCT_QUERY_KEYS.all, 'new-id'] as const,
};
