export interface IAdminCategory {
	id: number;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface ICreateCategoryRequest {
	name: string;
	description?: string;
}

export interface IUpdateCategoryRequest {
	name?: string;
	description?: string;
}

export interface ICategoryForm {
	name: string;
	description: string;
}
