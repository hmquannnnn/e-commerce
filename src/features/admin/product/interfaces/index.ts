import type { ProductSpecsFormValues, ProductSpecsPayload } from '@/src/features/product/specs/templates';

export interface IGenerateProductIdResponse {
	product_id: string;
}

export interface IImageInput {
	url: string;
	display_order: number;
	is_primary: boolean;
}

export interface ICreateProductRequest {
	product_id: string;
	name: string;
	description?: string;
	price: number;
	specs?: ProductSpecsPayload;
	category_id?: number;
	images: IImageInput[];
}

export interface ICreateProductResponse {
	id: string;
	name: string;
	description?: string;
	price: number;
	specs?: Record<string, unknown>;
	category_id?: number;
	images: ICreatedProductImage[];
	created_at: string;
	updated_at: string;
}

export interface ICreatedProductImage {
	id: string;
	product_id: string;
	url: string;
	display_order: number;
	is_primary: boolean;
	created_at: string;
}

export interface IGetPresignedUrlRequest {
	file_type: 'product';
	content_type: string;
	product_id: string;
}

export interface IGetPresignedUrlResponse {
	presigned_url: string;
	file_path: string;
	expires_in: number;
}

// Form-level types
export interface IProductImageFormItem {
	file: File;
	preview: string; // object URL for preview
	file_path?: string; // set after upload
	public_url?: string; // constructed from file_path
	is_primary: boolean;
	display_order: number;
	uploading: boolean;
	error?: string;
}

export interface ICreateProductForm {
	name: string;
	description: string;
	price: number | string;
	category_id: number | string;
	specs: ProductSpecsFormValues;
}
