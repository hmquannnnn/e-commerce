import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse, CustomHookMutationParams } from '@/src/core/api/interface';
import { useQuery, useMutation, DefaultError } from '@tanstack/react-query';
import {
	IGenerateProductIdResponse,
	IAdminProductDetail,
	IAdminProductListResponse,
	ICreateProductRequest,
	ICreateProductResponse,
	IGetPresignedUrlRequest,
	IGetPresignedUrlResponse,
	IInventory,
	IListAdminProductsQuery,
	IUpdateProductRequest,
	IUpdateStockRequest,
} from '../interfaces';
import { ADMIN_PRODUCT_QUERY_KEYS } from './query-keys';

const apiClient = initializeApiClientInstance({});

const cleanParams = (params: object) =>
	Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));

// ─── Product List / Detail ───────────────────────────────────────────────────

const getProducts = async (params: IListAdminProductsQuery): Promise<IAdminProductListResponse> =>
	apiClient
		.get<IApiResponse<IAdminProductListResponse>>('/products', { params: cleanParams(params) })
		.then((res) => res.data.data);

export const useAdminProducts = (params: IListAdminProductsQuery = {}) =>
	useQuery({
		queryKey: ADMIN_PRODUCT_QUERY_KEYS.list(params),
		queryFn: () => getProducts(params),
	});

const getProduct = async (id: string): Promise<IAdminProductDetail> =>
	apiClient.get<IApiResponse<IAdminProductDetail>>(`/products/${id}`).then((res) => res.data.data);

export const useAdminProduct = (id: string) =>
	useQuery({
		queryKey: ADMIN_PRODUCT_QUERY_KEYS.detail(id),
		queryFn: () => getProduct(id),
		enabled: !!id,
	});

// ─── Generate Product ID ─────────────────────────────────────────────────────

const generateProductId = async (): Promise<IGenerateProductIdResponse> =>
	apiClient.get<IApiResponse<IGenerateProductIdResponse>>('/products/new-id').then((res) => res.data.data);

export const useGenerateProductId = () =>
	useQuery({
		queryKey: ADMIN_PRODUCT_QUERY_KEYS.newId(),
		queryFn: generateProductId,
		staleTime: Infinity, // ID is one-time use; don't re-fetch automatically
		refetchOnWindowFocus: false,
	});

// ─── Create Product ──────────────────────────────────────────────────────────

const createProduct = async (request: ICreateProductRequest): Promise<ICreateProductResponse> =>
	apiClient.post<IApiResponse<ICreateProductResponse>>('/products', request).then((res) => res.data.data);

export const useCreateProduct = (
	params: CustomHookMutationParams<ICreateProductResponse, DefaultError, ICreateProductRequest> = {}
) =>
	useMutation({
		mutationFn: createProduct,
		...(params ?? {}),
	});

// ─── Update / Delete Product ─────────────────────────────────────────────────

const updateProduct = async ({
	id,
	request,
}: {
	id: string;
	request: IUpdateProductRequest;
}): Promise<IAdminProductDetail> =>
	apiClient.patch<IApiResponse<IAdminProductDetail>>(`/products/${id}`, request).then((res) => res.data.data);

export const useUpdateProduct = (
	params: CustomHookMutationParams<
		IAdminProductDetail,
		DefaultError,
		{ id: string; request: IUpdateProductRequest }
	> = {}
) =>
	useMutation({
		mutationFn: updateProduct,
		...(params ?? {}),
	});

const deleteProduct = async (id: string): Promise<void> => {
	await apiClient.delete(`/products/${id}`);
};

export const useDeleteProduct = (params: CustomHookMutationParams<void, DefaultError, string> = {}) =>
	useMutation({
		mutationFn: deleteProduct,
		...(params ?? {}),
	});

// ─── Inventory ───────────────────────────────────────────────────────────────

const getInventory = async (productId: string): Promise<IInventory> =>
	apiClient.get<IApiResponse<IInventory>>(`/inventory/${productId}`).then((res) => res.data.data);

export const useAdminInventory = (productId: string) =>
	useQuery({
		queryKey: ADMIN_PRODUCT_QUERY_KEYS.inventory(productId),
		queryFn: () => getInventory(productId),
		enabled: !!productId,
	});

const updateStock = async ({
	productId,
	request,
}: {
	productId: string;
	request: IUpdateStockRequest;
}): Promise<IInventory> =>
	apiClient.patch<IApiResponse<IInventory>>(`/inventory/${productId}/stock`, request).then((res) => res.data.data);

export const useUpdateStock = (
	params: CustomHookMutationParams<IInventory, DefaultError, { productId: string; request: IUpdateStockRequest }> = {}
) =>
	useMutation({
		mutationFn: updateStock,
		...(params ?? {}),
	});

// ─── Get Presigned URL ───────────────────────────────────────────────────────

const getPresignedUrl = async (request: IGetPresignedUrlRequest): Promise<IGetPresignedUrlResponse> =>
	apiClient.post<IApiResponse<IGetPresignedUrlResponse>>('/files/presigned-url', request).then((res) => res.data.data);

export const useGetPresignedUrl = (
	params: CustomHookMutationParams<IGetPresignedUrlResponse, DefaultError, IGetPresignedUrlRequest> = {}
) =>
	useMutation({
		mutationFn: getPresignedUrl,
		...(params ?? {}),
	});
