import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import { useQuery } from '@tanstack/react-query';
import { ICategory, IListProductsQuery, IProductDetail, IProductListResponse } from '../interfaces';
import { PRODUCT_QUERY_KEYS } from './query-keys';
import { getMockCategories, getMockProduct, getMockProducts } from './mock';

// set to false when backend is ready
const USE_MOCK = false;

const apiClient = initializeApiClientInstance({ includeAuthHeader: false });

const getProducts = async (params: IListProductsQuery): Promise<IProductListResponse> => {
	if (USE_MOCK) return getMockProducts(params);
	const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
	return apiClient
		.get<IApiResponse<IProductListResponse>>('/products', { params: cleanParams })
		.then((res) => res.data.data);
};

export const useProducts = (params: IListProductsQuery = {}) => {
	return useQuery({
		queryKey: [...PRODUCT_QUERY_KEYS.lists(), params],
		queryFn: () => getProducts(params),
	});
};

const getProduct = async (id: string): Promise<IProductDetail> => {
	if (USE_MOCK) return getMockProduct(id);
	return apiClient.get<IApiResponse<IProductDetail>>(`/products/${id}`).then((res) => res.data.data);
};

export const useProduct = (id: string) => {
	return useQuery({
		queryKey: PRODUCT_QUERY_KEYS.detail(id),
		queryFn: () => getProduct(id),
		enabled: !!id,
	});
};

const getCategories = async (): Promise<ICategory[]> => {
	if (USE_MOCK) return getMockCategories();
	return apiClient.get<IApiResponse<ICategory[]>>('/categories').then((res) => res.data.data);
};

export const useCategories = () => {
	return useQuery({
		queryKey: PRODUCT_QUERY_KEYS.categories(),
		queryFn: getCategories,
	});
};
