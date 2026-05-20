import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse, CustomHookMutationParams } from '@/src/core/api/interface';
import { DefaultError, useMutation, useQuery } from '@tanstack/react-query';
import { IAdminCategory, ICreateCategoryRequest, IUpdateCategoryRequest } from '../interfaces';
import { ADMIN_CATEGORY_QUERY_KEYS } from './query-keys';

const apiClient = initializeApiClientInstance({});

const getCategories = async (): Promise<IAdminCategory[]> =>
	apiClient.get<IApiResponse<IAdminCategory[]>>('/categories').then((res) => res.data.data);

export const useAdminCategories = () =>
	useQuery({
		queryKey: ADMIN_CATEGORY_QUERY_KEYS.lists(),
		queryFn: getCategories,
	});

const createCategory = async (request: ICreateCategoryRequest): Promise<IAdminCategory> =>
	apiClient.post<IApiResponse<IAdminCategory>>('/categories', request).then((res) => res.data.data);

export const useCreateCategory = (
	params: CustomHookMutationParams<IAdminCategory, DefaultError, ICreateCategoryRequest> = {}
) =>
	useMutation({
		mutationFn: createCategory,
		...(params ?? {}),
	});

const updateCategory = async ({
	id,
	request,
}: {
	id: number;
	request: IUpdateCategoryRequest;
}): Promise<IAdminCategory> =>
	apiClient.patch<IApiResponse<IAdminCategory>>(`/categories/${id}`, request).then((res) => res.data.data);

export const useUpdateCategory = (
	params: CustomHookMutationParams<IAdminCategory, DefaultError, { id: number; request: IUpdateCategoryRequest }> = {}
) =>
	useMutation({
		mutationFn: updateCategory,
		...(params ?? {}),
	});

const deleteCategory = async (id: number): Promise<void> => {
	await apiClient.delete(`/categories/${id}`);
};

export const useDeleteCategory = (params: CustomHookMutationParams<void, DefaultError, number> = {}) =>
	useMutation({
		mutationFn: deleteCategory,
		...(params ?? {}),
	});
