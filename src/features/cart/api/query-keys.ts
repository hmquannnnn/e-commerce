export const CART_QUERY_KEYS = {
	all: ['cart'] as const,
	cart: () => [...CART_QUERY_KEYS.all] as const,
};
