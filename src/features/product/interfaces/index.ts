export interface IProductImage {
	id: string;
	product_id: string;
	url: string;
	display_order: number;
	is_primary: boolean;
	created_at: string;
}

export interface IProduct {
	id: string;
	name: string;
	description?: string;
	price: number;
	specs?: Record<string, unknown>;
	category_id?: number;
	primary_image_url?: string;
	created_at: string;
	updated_at: string;
}

export interface IProductDetail extends IProduct {
	images: IProductImage[];
}

export interface ICategory {
	id: number;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface IListProductsQuery {
	category_id?: number;
	search?: string;
	min_price?: number;
	max_price?: number;
	page?: number;
	limit?: number;
}

export interface IProductListResponse {
	items: IProduct[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
}
