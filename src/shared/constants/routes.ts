export const ROUTES = {
	HOME: '/',
	CART: '/cart',
	CHECKOUT: '/checkout',
	ORDERS: {
		LIST: '/orders',
		DETAIL: (id: string) => `/orders/${id}`,
	},
	PAYMENT: {
		RESULT: '/payment/result',
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
		CATEGORIES: {
			LIST: '/admin/categories',
		},
		ORDERS: {
			LIST: '/admin/orders',
			DETAIL: (id: string) => `/admin/orders/${id}`,
		},
	},
};
