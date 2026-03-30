export const ADMIN_PRODUCT_QUERY_KEYS = {
	all: ['admin', 'products'] as const,
	newId: () => [...ADMIN_PRODUCT_QUERY_KEYS.all, 'new-id'] as const,
};
