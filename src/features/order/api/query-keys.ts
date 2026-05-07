export const ORDER_QUERY_KEYS = {
	all: ['orders'] as const,
	lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
	list: (page: number, limit: number) => [...ORDER_QUERY_KEYS.lists(), page, limit] as const,
	detail: (id: string) => [...ORDER_QUERY_KEYS.all, 'detail', id] as const,
};
