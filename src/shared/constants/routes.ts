export const ROUTES = {
	HOME: '/',
	CART: '/cart',
	CHECKOUT: '/checkout',
	ORDERS: {
		LIST: '/orders',
		DETAIL: (id: string) => `/orders/${id}`,
	},
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
	},
	PRODUCTS: {
		DETAIL: (id: string) => `/products/${id}`,
	},
	ADMIN: {
		PRODUCTS: {
			LIST: '/admin/products',
			NEW: '/admin/products/new',
			DETAIL: (id: string) => `/admin/products/${id}`,
			EDIT: (id: string) => `/admin/products/${id}/edit`,
		},
	},
};
