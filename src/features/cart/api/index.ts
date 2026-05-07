'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initializeApiClientInstance } from '@/src/core/api';
import { IApiResponse } from '@/src/core/api/interface';
import { useAppSelector } from '@/src/core/store/store';
import { IAddCartItemRequest, ICart, ICartItem, IUpdateCartItemRequest } from '../interfaces';
import { CART_QUERY_KEYS } from './query-keys';

const authClient = initializeApiClientInstance({ includeAuthHeader: true });

const getCart = (): Promise<ICart> => authClient.get<IApiResponse<ICart>>('/cart').then((res) => res.data.data);

export const useCart = () => {
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	return useQuery({
		queryKey: CART_QUERY_KEYS.cart(),
		queryFn: getCart,
		enabled: isAuthenticated,
		staleTime: 30_000,
	});
};

export const useAddCartItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IAddCartItemRequest): Promise<ICartItem> =>
			authClient.post<IApiResponse<ICartItem>>('/cart/items', data).then((res) => res.data.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
		},
	});
};

export const useUpdateCartItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ productId, data }: { productId: string; data: IUpdateCartItemRequest }): Promise<ICartItem> =>
			authClient.put<IApiResponse<ICartItem>>(`/cart/items/${productId}`, data).then((res) => res.data.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
		},
	});
};

export const useRemoveCartItem = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (productId: string): Promise<void> =>
			authClient.delete(`/cart/items/${productId}`).then(() => undefined),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
		},
	});
};
