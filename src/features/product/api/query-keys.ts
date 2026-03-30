export const PRODUCT_QUERY_KEYS = {
	all: ['products'] as const,
	lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
	list: (params: Record<string, unknown>) => [...PRODUCT_QUERY_KEYS.lists(), params] as const,
	detail: (id: string) => [...PRODUCT_QUERY_KEYS.all, 'detail', id] as const,
	categories: () => ['categories'] as const,
};
