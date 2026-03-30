import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse, CustomHookMutationParams } from '@/src/core/api/interface';
import { useQuery, useMutation, DefaultError } from '@tanstack/react-query';
import {
	IGenerateProductIdResponse,
	ICreateProductRequest,
	ICreateProductResponse,
	IGetPresignedUrlRequest,
	IGetPresignedUrlResponse,
} from '../interfaces';
import { ADMIN_PRODUCT_QUERY_KEYS } from './query-keys';

const apiClient = initializeApiClientInstance({});

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
