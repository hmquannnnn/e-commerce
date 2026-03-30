export const ROUTES = {
	HOME: '/',
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
