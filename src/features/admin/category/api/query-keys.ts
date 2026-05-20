export const ADMIN_CATEGORY_QUERY_KEYS = {
	all: ['admin', 'categories'] as const,
	lists: () => [...ADMIN_CATEGORY_QUERY_KEYS.all, 'list'] as const,
};
