'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { initializeApiClientInstance } from '@/src/core/api';
import { useAppSelector } from '@/src/core/store/store';
import { CART_QUERY_KEYS } from '@/src/features/cart/api/query-keys';
import { ICreateOrderRequest, IOrder, IOrderListResponse } from '../interfaces';
import { ORDER_QUERY_KEYS } from './query-keys';

const authClient = initializeApiClientInstance({ includeAuthHeader: true });

type OrderEnvelope<T> = { success: boolean; message: string; data: T };

const getOrders = async (page: number, limit: number): Promise<IOrderListResponse> => {
	const res = await authClient.get<OrderEnvelope<IOrderListResponse>>('/orders', {
		params: { page, limit },
	});
	return res.data.data;
};

export const useOrders = (page: number, limit = 20) => {
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	return useQuery({
		queryKey: ORDER_QUERY_KEYS.list(page, limit),
		queryFn: () => getOrders(page, limit),
		enabled: isAuthenticated,
	});
};

const getOrder = async (id: string): Promise<IOrder> => {
	const res = await authClient.get<OrderEnvelope<IOrder>>(`/orders/${id}`);
	return res.data.data;
};

export const useOrder = (id: string) => {
	const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
	return useQuery({
		queryKey: ORDER_QUERY_KEYS.detail(id),
		queryFn: () => getOrder(id),
		enabled: !!id && isAuthenticated,
	});
};

export const useCreateOrder = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: ICreateOrderRequest): Promise<IOrder> => {
			const res = await authClient.post<OrderEnvelope<IOrder>>('/orders', body);
			return res.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart() });
		},
	});
};

export const useCancelOrder = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (orderId: string): Promise<void> => {
			await authClient.patch(`/orders/${orderId}/cancel`);
		},
		onSuccess: (_data, orderId) => {
			queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
			queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.detail(orderId) });
		},
	});
};

/** Extract backend error code from axios error (order-service shape: success, error, message) */
export const getOrderErrorCode = (err: unknown): string | undefined => {
	if (!axios.isAxiosError(err)) return undefined;
	const data = err.response?.data as { error?: string } | undefined;
	return data?.error;
};
